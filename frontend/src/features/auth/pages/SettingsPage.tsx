import { useState, useEffect } from "react";
import {
  useForm,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { AxiosError } from "axios";

import { useAuth } from "@/hooks/authContext";
import { authService } from "../services/auth.service";
import {
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileValues,
  type UpdatePasswordValues,
} from "../schemas/settings.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowPassword((v) => !v)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export function SettingsPage() {
  const { user, login, logout } = useAuth();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name ?? "",
      });
    }
  }, [user, profileForm]);

  const onUpdateProfile = async (data: UpdateProfileValues) => {
    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile(data);
      if (res.data?.user) {
        const safeName = res.data.user.name ?? "";
        login({ ...user!, name: safeName });
        toast.success("Profile updated successfully");
        profileForm.reset({ name: safeName });
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const passwordForm = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      passwordConfirm: "",
    },
  });

  const onUpdatePassword = async (data: UpdatePasswordValues) => {
    setIsUpdatingPassword(true);
    try {
      await authService.updatePassword(data);
      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error) {
      let msg = "Failed to update password";
      if (error instanceof AxiosError && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      toast.success("Account deleted successfully");
      logout();
    } catch {
      toast.error("Failed to delete account");
      setIsDeleting(false);
    }
  };

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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your public display information.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Input
                        value={user?.email ?? ""}
                        disabled
                        className="bg-muted/50 cursor-not-allowed pr-10"
                      />
                      <Lock className="text-muted-foreground absolute top-2.5 right-3 h-4 w-4 opacity-70" />
                    </div>
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your name" />
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
                      isUpdatingProfile || !profileForm.formState.isDirty
                    }
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {isUpdatingProfile ? (
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
                onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
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
                      isUpdatingPassword || !passwordForm.formState.isDirty
                    }
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {isUpdatingPassword ? (
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      onDeleteAccount();
                    }}
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
