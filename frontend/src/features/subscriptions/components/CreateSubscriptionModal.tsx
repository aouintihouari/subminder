import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type SubscriptionFormData,
  subscriptionSchema,
} from "@/features/subscriptions/schemas/subscriptionSchema";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Category,
  Frequency,
  type Subscription,
} from "@/features/subscriptions/types/types";
import { CalendarIcon, Sparkles, Loader2, Calendar } from "lucide-react";

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionToEdit?: Subscription;
}

export function CreateSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  subscriptionToEdit,
}: CreateSubscriptionModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!subscriptionToEdit;

  const createMutation = useMutation({
    mutationFn: (data: SubscriptionFormData & { startDate: string }) =>
      subscriptionService.create(data),
    onSuccess: () => {
      toast.success("Subscription created successfully");
      finalizeAction();
    },
    onError: () => toast.error("Failed to create subscription"),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: {
      id: number;
      data: SubscriptionFormData & { startDate: string };
    }) => subscriptionService.update(variables.id, variables.data),
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      finalizeAction();
    },
    onError: () => toast.error("Failed to update subscription"),
  });

  const finalizeAction = () => {
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    onSuccess();
    onClose();
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "EUR",
      frequency: Frequency.MONTHLY,
      category: Category.OTHER,
      startDate: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (subscriptionToEdit) {
      reset({
        name: subscriptionToEdit.name,
        price: subscriptionToEdit.price,
        currency: subscriptionToEdit.currency as "EUR" | "USD" | "GBP",
        frequency: subscriptionToEdit.frequency,
        category: subscriptionToEdit.category,
        startDate: new Date(subscriptionToEdit.startDate)
          .toISOString()
          .split("T")[0],
        description: subscriptionToEdit.description ?? "",
      });
    } else {
      reset({
        name: "",
        price: 0,
        currency: "EUR" as const,
        frequency: Frequency.MONTHLY,
        category: Category.OTHER,
        startDate: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [isOpen, subscriptionToEdit, reset]);

  const onSubmit = (data: SubscriptionFormData) => {
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
    };

    if (isEditing && subscriptionToEdit) {
      updateMutation.mutate({ id: subscriptionToEdit.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-card overflow-hidden border-none bg-white p-0 shadow-2xl sm:max-w-125">
        <div className="dark:border-border border-b border-indigo-100/50 bg-linear-to-r from-indigo-50 to-violet-50 px-6 py-6 dark:from-indigo-950/30 dark:to-violet-950/30">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500">
                {isEditing ? (
                  <CalendarIcon className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <DialogTitle className="dark:text-foreground text-xl font-bold text-gray-900">
                {isEditing ? "Edit Subscription" : "New Subscription"}
              </DialogTitle>
            </div>
            <DialogDescription className="dark:text-muted-foreground text-gray-500">
              {isEditing
                ? "Update the details of your recurring expense."
                : "Add a new recurring expense to your dashboard."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-6">
          <div className="space-y-1">
            <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
              Service Name
            </label>
            <Input
              {...register("name")}
              placeholder="Netflix, Spotify, Gym..."
              className={`dark:border-border dark:bg-input/20 ${errors.name ? "border-red-500 focus:ring-red-200" : ""}`}
            />
            {errors.name && (
              <p className="ml-1 text-xs font-medium text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
                Amount
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                onFocus={(e) => e.target.select()}
                className={`dark:border-border dark:bg-input/20 ${errors.price ? "border-red-500 focus:ring-red-200" : ""}`}
              />
              {errors.price && (
                <p className="ml-1 text-xs font-medium text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
                Currency
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="dark:border-border dark:bg-input/20 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
                Frequency
              </label>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="dark:border-border dark:bg-input/20 w-full cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Frequency).map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0) + freq.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
                Category
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="dark:border-border dark:bg-input/20 w-full cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Category).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
              Start Date
            </label>
            <div className="group relative transition-all duration-200">
              <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="date"
                {...register("startDate")}
                className={`dark:border-border dark:bg-input/20 cursor-pointer pl-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                  errors.startDate ? "border-red-500 focus:ring-red-200" : ""
                }`}
              />
            </div>
            {errors.startDate && (
              <p className="ml-1 text-xs font-medium text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="dark:text-muted-foreground ml-1 text-xs font-semibold text-gray-500 uppercase">
              Note (optional)
            </label>
            <Textarea
              {...register("description")}
              className="dark:border-border dark:bg-input/20 min-h-20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="dark:border-border dark:text-foreground dark:hover:bg-accent cursor-pointer border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-600"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Subscription"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
