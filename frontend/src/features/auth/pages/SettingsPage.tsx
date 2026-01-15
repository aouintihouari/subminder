import { useState } from "react";
import {
  useForm,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Coins,
  Mail,
} from "lucide-react";
import { AxiosError } from "axios";

import { useAuth } from "@/hooks/useAuth";
import { useUser, USER_QUERY_KEY } from "@/hooks/useUser";
import { authService } from "../services/auth.service";
import {
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileValues,
  type UpdatePasswordValues,
} from "../schemas/settings.schema";
import { CURRENCIES } from "@/config/currencies";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { type UpdateProfileDTO } from "../types/types";

// --- Sub-components ---

type PasswordInputProps<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  placeholder?: string;
  testId?: string;
};

const PasswordInput = <T extends FieldValues>({
  field,
  placeholder,
  testId,
}: PasswordInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder ?? ""}
        {...field}
        data-testid={testId}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground absolute top-0 right-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowPassword((v) => !v)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

// --- Main Page Component ---

export function SettingsPage() {
  const { login, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: user } = useUser();

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", email: "", preferredCurrency: "USD" },

    values: user
      ? {
          name: user.name ?? "",
          email: user.email ?? "",
          preferredCurrency: user.preferredCurrency ?? "USD",
        }
      : undefined,
  });

  const passwordForm = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      passwordConfirm: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileDTO) => authService.updateProfile(data),
    onSuccess: (response) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });

      if (response.data?.user && user)
        login({ ...user, ...response.data.user });

      profileForm.reset({
        name: response.data?.user?.name ?? "",
        email: user?.email ?? "",
        preferredCurrency: response.data?.user?.preferredCurrency ?? "USD",
      });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const requestEmailChangeMutation = useMutation({
    mutationFn: (newEmail: string) => authService.requestEmailChange(newEmail),
    onSuccess: () => {
      toast.info("Verification link sent. Please check your new inbox.");
    },
    onError: (error) => {
      let msg = "Failed to initiate email change";
      if (error instanceof AxiosError && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordValues) =>
      authService.updatePassword(data),
    onSuccess: () => {
      toast.success("Password updated successfully");
      passwordForm.reset();
    },
    onError: (error) => {
      let msg = "Failed to update password";
      if (error instanceof AxiosError && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      logout();
      queryClient.clear();
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  // --- Handlers ---

  const onProfileSubmit = (data: UpdateProfileValues) => {
    const { dirtyFields } = profileForm.formState;

    if (dirtyFields.email && data.email !== user?.email)
      requestEmailChangeMutation.mutate(data.email);

    if (dirtyFields.name || dirtyFields.preferredCurrency)
      updateProfileMutation.mutate({
        name: data.name,
        preferredCurrency: data.preferredCurrency,
      });
  };

  const isProfileLoading =
    updateProfileMutation.isPending || requestEmailChangeMutation.isPending;

  return (
    <div className="animate-in fade-in container mx-auto max-w-4xl space-y-8 p-6 duration-500">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* --- Profile Card --- */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle>Profile & Preferences</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and application preferences.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              className="pr-10"
                            />
                            <Mail className="text-muted-foreground absolute top-2.5 right-3 h-4 w-4 opacity-50" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Changing your email requires verification.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your name" />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-muted/50 dark:bg-secondary/30 border-border/50 rounded-lg border p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-medium">Regional Settings</h3>
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="preferredCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Currency</FormLabel>
                        <Select
                          key={field.value}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background w-full md:w-50">
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent
                            position="popper"
                            sideOffset={5}
                            className="max-h-50"
                          >
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          This currency will be used to calculate and display
                          your dashboard statistics.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={
                      isProfileLoading || !profileForm.formState.isDirty
                    }
                    className="cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {isProfileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* --- Security Card --- */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Ensure your account is secure by using a strong password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit((data) =>
                  updatePasswordMutation.mutate(data),
                )}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          testId="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput field={field} testId="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            field={field}
                            testId="confirm-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={
                      updatePasswordMutation.isPending ||
                      !passwordForm.formState.isDirty
                    }
                    className="cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {updatePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* --- Danger Zone Card --- */}
        <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-red-600/80 dark:text-red-500/80">
              Irreversible actions. Proceed with caution.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="cursor-pointer dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        deleteAccountMutation.mutate();
                      }}
                      disabled={deleteAccountMutation.isPending}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {deleteAccountMutation.isPending
                        ? "Deleting..."
                        : "Yes, delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
