"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Pencil,
  Pizza,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { menuCategories } from "@/data/menu-items";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Express Backend URL।
const API_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:7000";

// MongoDB থেকে আসা Menu Item-এর structure।
interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  isActive: boolean;
}

// Subscription type।
type VendorPlan = "free" | "premium" | "premium_plus";

// API response।
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  plan?: VendorPlan;
  imageUrl?: string;
  data?: T;
}

// Add/Edit form structure।
interface MenuForm {
  name: string;
  description: string;
  category: string;
  price: string;
  image: string;
  isActive: boolean;
}

// Empty form তৈরি করার function।
function emptyForm(): MenuForm {
  return {
    name: "",
    description: "",
    category: menuCategories[0],
    price: "",
    image: "",
    isActive: true,
  };
}

// API response JSON safely read করার helper।
async function readApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Request failed. Please try again."
    );
  }

  return result;
}

export default function VendorMenuPage() {
  // Menu item list।
  const [items, setItems] = useState<MenuItem[]>([]);

  // Vendor subscription।
  const [plan, setPlan] = useState<VendorPlan>("free");

  // Page status।
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Page এবং modal-এর error আলাদা রাখছি।
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // Search।
  const [search, setSearch] = useState("");

  // Modal open/close।
  const [dialogOpen, setDialogOpen] = useState(false);

  // null = Add, ID = Edit।
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form data।
  const [form, setForm] = useState<MenuForm>(emptyForm());

  // Selected image file।
  const [selectedFile, setSelectedFile] = useState<File | null>(
    null
  );

  // Image preview।
  const [previewUrl, setPreviewUrl] = useState("");

  // ========================================
  // LOAD VENDOR MENU FROM MONGODB
  // ========================================
  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/menu/my`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await readApiResponse<MenuItem[]>(
        response
      );

      setItems(result.data ?? []);
      setPlan(result.plan ?? "free");
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Page load হলে API call।
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // ========================================
  // IMAGE PREVIEW
  // ========================================
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    // Component cleanup হলে temporary URL remove।
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // ========================================
  // MENU STATISTICS
  // ========================================
  const activeCount = items.filter(
    (item) => item.isActive
  ).length;

  const isFree = plan === "free";

  const remaining = isFree
    ? Math.max(0, 3 - activeCount)
    : null;

  // Menu search।
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) =>
      [item.name, item.category, item.description].some(
        (value) => value.toLowerCase().includes(keyword)
      )
    );
  }, [items, search]);

  // ========================================
  // ADD PIZZA MODAL
  // ========================================
  function openAddDialog() {
    setEditingId(null);
    setSelectedFile(null);
    setFormError("");

    // Free plan quota full হলে inactive দিয়ে শুরু।
    setForm({
      ...emptyForm(),
      isActive: !isFree || activeCount < 3,
    });

    setDialogOpen(true);
  }

  // ========================================
  // EDIT PIZZA MODAL
  // ========================================
  function openEditDialog(item: MenuItem) {
    setEditingId(item._id);
    setSelectedFile(null);
    setFormError("");

    // Existing data form-এ বসাচ্ছি।
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: String(item.price),
      image: item.image,
      isActive: item.isActive,
    });

    setDialogOpen(true);
  }

  // Reusable form state updater।
  function updateForm<K extends keyof MenuForm>(
    field: K,
    value: MenuForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // ========================================
  // SELECT PIZZA IMAGE
  // ========================================
  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setSelectedFile(file);
  }

  // ========================================
  // UPLOAD IMAGE TO BACKEND → IMGBB
  // ========================================
  async function uploadImage(file: File): Promise<string> {
    const data = new FormData();

    data.append("image", file);

    // Backend-এ ImgBB API key থাকবে।
    const response = await fetch(
      `${API_URL}/api/upload/image`,
      {
        method: "POST",
        credentials: "include",
        body: data,
      }
    );

    const result = await readApiResponse(response);

    if (!result.imageUrl) {
      throw new Error("Image URL was not returned.");
    }

    return result.imageUrl;
  }

  // ========================================
  // SAVE PIZZA — ADD OR EDIT
  // ========================================
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    // Add mode-এ image mandatory।
    if (!editingId && !selectedFile) {
      setFormError("Please choose a pizza image.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    // Existing item edit হচ্ছে কি না।
    const existingItem = items.find(
      (item) => item._id === editingId
    );

    // নতুন item activate বা inactive item activate করা হচ্ছে।
    const activating =
      form.isActive &&
      (!existingItem || !existingItem.isActive);

    // Frontend restriction।
    // Backend-এও একই restriction enforce হচ্ছে।
    if (isFree && activating && activeCount >= 3) {
      setFormError(
        "Free plan supports a maximum of 3 active items."
      );
      return;
    }

    setSaving(true);

    try {
      // Edit হলে পুরোনো image ব্যবহার করা যাবে।
      let imageUrl = form.image;

      // নতুন file থাকলে ImgBB upload।
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price,
        image: imageUrl,
        isActive: form.isActive,
      };

      // Add = POST, Edit = PATCH।
      const endpoint = editingId
        ? `${API_URL}/api/menu/${editingId}`
        : `${API_URL}/api/menu`;

      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await readApiResponse(response);

      const wasEditing = Boolean(editingId);

      // Dialog বন্ধ করছি।
      setDialogOpen(false);
      setSelectedFile(null);

      // Success message।
      setSuccess(
        wasEditing
          ? "Pizza updated successfully."
          : "Pizza added successfully."
      );

      // Database থেকে latest menu load।
      await loadItems();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to save pizza."
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // DELETE PIZZA
  // ========================================
  async function deleteItem(item: MenuItem) {
    const confirmed = window.confirm(
      `Delete "${item.name}" permanently?`
    );

    if (!confirmed) return;

    setBusyId(item._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/menu/${item._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      await readApiResponse(response);

      setSuccess("Pizza deleted successfully.");
      await loadItems();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete pizza."
      );
    } finally {
      setBusyId(null);
    }
  }

  // ========================================
  // ACTIVE / INACTIVE TOGGLE
  // ========================================
  async function toggleStatus(item: MenuItem) {
    setBusyId(item._id);
    setError("");
    setSuccess("");

    try {
      // Backend full item validation করে,
      // তাই সব editable fields পাঠাচ্ছি।
      const response = await fetch(
        `${API_URL}/api/menu/${item._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            image: item.image,
            isActive: !item.isActive,
          }),
        }
      );

      await readApiResponse(response);

      setSuccess("Menu status updated successfully.");
      await loadItems();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update menu status."
      );
    } finally {
      setBusyId(null);
    }
  }

  // ========================================
  // MAIN PAGE UI
  // ========================================
  return (
    <main className="bg-[#FFF9F2] px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Back button */}
        <Link
          href="/dashboard/vendor"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#D62828]"
        >
          <ArrowLeft size={17} />
          Back to Vendor Dashboard
        </Link>

        {/* Page header */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">
              Menu Management
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Add, edit and manage your restaurant menu.
            </p>
          </div>

          <div className="flex items-center gap-2">

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => void loadItems()}
              disabled={loading}
              className="rounded-xl border border-stone-200 bg-white p-3 text-stone-600 disabled:opacity-50"
              aria-label="Refresh menu"
            >
              <RefreshCw size={19} />
            </button>

            {/* Add Pizza button */}
            <button
              type="button"
              onClick={openAddDialog}
              disabled={loading || Boolean(error)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Plus size={18} />
              Add Pizza
            </button>
          </div>
        </div>

        {/* Page error */}
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </p>
        )}

        {/* Menu statistics */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Items",
              value: items.length,
            },
            {
              label: "Active Items",
              value: activeCount,
            },
            {
              label: "Available Quota",
              value:
                remaining === null ? "Unlimited" : remaining,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-stone-500">
                {stat.label}
              </p>

              <p className="mt-2 text-2xl font-extrabold text-[#D62828]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Current subscription */}
        <p className="mt-4 text-sm text-stone-600">
          Current Plan:{" "}
          <span className="font-bold capitalize text-[#D62828]">
            {plan === "premium_plus" ? "Premium+" : plan}
          </span>
          {isFree && " — Maximum 3 active menu items"}
        </p>

        {/* Menu list container */}
        <section className="mt-6 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">

          {/* Search field */}
          <div className="relative mb-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search pizza..."
              className="h-12 w-full rounded-xl border border-stone-200 pl-11 pr-4 outline-none focus:border-[#D62828]"
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
              <Loader2 className="animate-spin" size={20} />
              Loading menu...
            </div>
          ) : filteredItems.length === 0 ? (
            // Empty state।
            <div className="py-14 text-center">
              <Pizza
                size={40}
                className="mx-auto text-orange-300"
              />

              <h2 className="mt-4 text-xl font-bold">
                No Menu Items Found
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                {search
                  ? "Try another search."
                  : "Click Add Pizza to create your first item."}
              </p>
            </div>
          ) : (
            // MongoDB item list।
            <div className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <article
                  key={item._id}
                  className="flex flex-wrap items-center gap-4 py-4"
                >
                  {/* Pizza image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl bg-orange-50 object-cover"
                  />

                  {/* Pizza details */}
                  <div className="min-w-36 flex-1">

                    <h3 className="font-extrabold text-stone-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs text-stone-500">
                      {item.category}
                    </p>

                    <p className="mt-1 font-bold text-[#D62828]">
                      ৳{item.price.toLocaleString("en-BD")}
                    </p>

                    <p
                      className={
                        item.isActive
                          ? "mt-1 text-xs font-semibold text-green-700"
                          : "mt-1 text-xs font-semibold text-stone-500"
                      }
                    >
                      {item.isActive ? "● Active" : "● Inactive"}
                    </p>
                  </div>

                  {/* Item actions */}
                  <div className="flex flex-wrap gap-2">

                    {/* Active / Inactive */}
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() =>
                        void toggleStatus(item)
                      }
                      className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      {busyId === item._id
                        ? "Updating..."
                        : item.isActive
                          ? "Deactivate"
                          : "Activate"}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditDialog(item)}
                      disabled={busyId !== null}
                      aria-label={`Edit ${item.name}`}
                      className="rounded-lg bg-orange-50 p-2.5 text-orange-700 disabled:opacity-50"
                    >
                      <Pencil size={17} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        void deleteItem(item)
                      }
                      disabled={busyId !== null}
                      aria-label={`Delete ${item.name}`}
                      className="rounded-lg bg-red-50 p-2.5 text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ====================================
            ADD / EDIT PIZZA POPUP
            ==================================== */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!saving) {
              setDialogOpen(open);
            }
          }}
        >
          <DialogContent className="max-h-[90dvh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:max-w-lg">

            <DialogTitle className="text-2xl font-extrabold">
              {editingId ? "Edit Pizza" : "Add New Pizza"}
            </DialogTitle>

            <DialogDescription className="text-sm text-stone-500">
              Enter the menu details below.
            </DialogDescription>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Pizza Name */}
              <div>
                <label
                  htmlFor="pizza-name"
                  className="mb-1 block text-sm font-bold"
                >
                  Pizza Name
                </label>

                <input
                  id="pizza-name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="Classic Margherita"
                  className="h-11 w-full rounded-xl border border-stone-200 px-3 outline-none focus:border-red-500"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="pizza-category"
                  className="mb-1 block text-sm font-bold"
                >
                  Category
                </label>

                <select
                  id="pizza-category"
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3"
                >
                  {menuCategories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="pizza-price"
                  className="mb-1 block text-sm font-bold"
                >
                  Price (BDT)
                </label>

                <input
                  id="pizza-price"
                  type="number"
                  min="1"
                  max="100000"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(event) =>
                    updateForm("price", event.target.value)
                  }
                  placeholder="599"
                  className="h-11 w-full rounded-xl border border-stone-200 px-3 outline-none focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="pizza-description"
                  className="mb-1 block text-sm font-bold"
                >
                  Description
                </label>

                <textarea
                  id="pizza-description"
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe your pizza..."
                  className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-red-500"
                />
              </div>

              {/* Image upload */}
              <div>
                <label
                  htmlFor="pizza-image"
                  className="mb-1 block text-sm font-bold"
                >
                  Pizza Image
                </label>

                <label
                  htmlFor="pizza-image"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-4 text-sm font-semibold text-orange-800"
                >
                  <ImagePlus size={22} />

                  {selectedFile
                    ? selectedFile.name
                    : "Choose JPG, PNG or WebP (Max 5 MB)"}
                </label>

                <input
                  id="pizza-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />

                {/* Selected/Existing image preview */}
                {(previewUrl || form.image) && (
                  <img
                    src={previewUrl || form.image}
                    alt="Pizza preview"
                    className="mt-3 h-32 w-full rounded-xl object-cover"
                  />
                )}
              </div>

              {/* Active checkbox */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#FFF9F2] p-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm(
                      "isActive",
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 accent-[#D62828]"
                />

                <span className="text-sm font-semibold">
                  Active — Visible to customers
                </span>
              </label>

              {/* Form error */}
              {formError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              {/* Form buttons */}
              <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setDialogOpen(false)
                  }
                  className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-bold text-stone-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingId
                        ? "Save Changes"
                        : "Add Pizza"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}