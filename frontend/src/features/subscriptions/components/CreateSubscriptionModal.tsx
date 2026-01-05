import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createSubscriptionSchema,
  type CreateSubscriptionFormValues,
} from "../schemas/createSubscription.schema";
import { subscriptionService } from "../services/subscription.service";
import { Frequency, Category, type Subscription } from "../types/types";

interface CreateSubscriptionModalProps {
  onSuccess: () => void;
  subscriptionToEdit?: Subscription | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreateSubscriptionModal({
  onSuccess,
  subscriptionToEdit,
  isOpen,
  onClose,
}: CreateSubscriptionModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const showModal = isOpen !== undefined ? isOpen : internalOpen;
  const setShowModal = onClose || setInternalOpen;

  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateSubscriptionFormValues>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "EUR",
      frequency: Frequency.MONTHLY,
      category: Category.ENTERTAINMENT,
      startDate: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (subscriptionToEdit) {
      form.reset({
        name: subscriptionToEdit.name,
        price: subscriptionToEdit.price,
        currency: subscriptionToEdit.currency,
        frequency: subscriptionToEdit.frequency,
        category: subscriptionToEdit.category,
        startDate: new Date(subscriptionToEdit.startDate)
          .toISOString()
          .split("T")[0],
        description: subscriptionToEdit.description || "",
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        currency: "EUR",
        frequency: Frequency.MONTHLY,
        category: Category.ENTERTAINMENT,
        startDate: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [subscriptionToEdit, form, showModal]);

  const onSubmit = async (data: CreateSubscriptionFormValues) => {
    setServerError(null);
    try {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
      };

      if (subscriptionToEdit) {
        // MODE UPDATE
        await subscriptionService.update(subscriptionToEdit.id, formattedData);
      } else await subscriptionService.create(formattedData);

      setShowModal(false);
      if (!subscriptionToEdit) form.reset();
      onSuccess();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Failed to save subscription.");
      }
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      {!onClose && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Subscription
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {subscriptionToEdit ? "Edit Subscription" : "New Subscription"}
          </DialogTitle>
          <DialogDescription>
            {subscriptionToEdit
              ? "Update your subscription details."
              : "Add a new recurring expense to track."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix, Gym..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PRICE & CURRENCY */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* FREQUENCY & CATEGORY */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Frequency).map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Category).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* START DATE */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION (NOUVEAU) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note / Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share with mom, cancel next month..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <div className="text-destructive text-sm font-medium">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {subscriptionToEdit
                ? "Update Subscription"
                : "Create Subscription"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
