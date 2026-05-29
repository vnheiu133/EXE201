"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon, MailIcon, UserIcon, EditIcon, SaveIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProfile, changePassword } from "@/components/api/user";
import { getShopByUserId, updateShopImage } from "@/components/api/shop";
import { UserRole } from "@/enum/UserRole";
import { DEFAULT_SHOP_AVATAR, getAvatarUrl } from "@/lib/avatar";

export default function ProfilePage() {
  const { user: authUser, setUser, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storedUser, setStoredUser] = useState<any>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [shopImageUrl, setShopImageUrl] = useState("");

  // Load dữ liệu từ localStorage chỉ trên client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setStoredUser(parsedUser);
        // Chỉ cập nhật formData nếu cần thiết
        if (!authUser || JSON.stringify(formData) !== JSON.stringify({
          fullName: parsedUser.fullName || "",
          email: parsedUser.email || "",
          phoneNumber: parsedUser.phoneNumber || "",
          dateOfBirth: parsedUser.dateOfBirth || "",
          address: parsedUser.address || "",
        })) {
          setFormData({
            fullName: parsedUser.fullName || "",
            email: parsedUser.email || "",
            phoneNumber: parsedUser.phoneNumber || "",
            dateOfBirth: parsedUser.dateOfBirth || "",
            address: parsedUser.address || "",
          });
        }
      }
    }

    // Ưu tiên dữ liệu từ authUser nếu có
    if (authUser && JSON.stringify(formData) !== JSON.stringify({
      fullName: authUser.fullName || "",
      email: authUser.email || "",
      phoneNumber: authUser.phoneNumber || "",
      dateOfBirth: authUser.dateOfBirth || "",
      address: authUser.address || "",
    })) {
      setFormData({
        fullName: authUser.fullName || "",
        email: authUser.email || "",
        phoneNumber: authUser.phoneNumber || "",
        dateOfBirth: authUser.dateOfBirth || "",
        address: authUser.address || "",
      });
    }

    // Redirect nếu chưa đăng nhập
    if (!authUser && !storedUser && typeof window !== "undefined" && !localStorage.getItem("user")) {
      router.push("/login");
    }
  }, [authUser, router]); // Loại bỏ storedUser khỏi dependency để tránh vòng lặp

  const currentUser = authUser || storedUser;
  const isShopOwner = currentUser?.role === "shop" || currentUser?.role === UserRole.Shop || currentUser?.role === 2;

  useEffect(() => {
    const userId = currentUser?.userId;
    if (!userId || !isShopOwner) return;

    getShopByUserId(userId).then((response) => {
      if (response.success && response.data) {
        setShopData(response.data);
        setShopImageUrl(response.data.shopImageUrl || "");
      }
    });
  }, [currentUser?.userId, isShopOwner]);

  const handleSaveShopImage = async () => {
    try {
      if (!shopData?.shopId) throw new Error("Shop not found");
      if (!shopImageUrl.trim()) throw new Error("Shop image URL is required");

      const response = await updateShopImage(shopData.shopId, shopImageUrl.trim());
      if (!response.success) throw new Error(response.message || "Failed to update shop image");

      setShopData(response.data);
      setError(null);
      setSuccess("Shop image updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating shop image");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userId = authUser?.userId || (storedUser?.userId ?? "");
      if (!userId) throw new Error("User ID not found");

      // Validation
      if (!formData.fullName || formData.fullName.length < 2) {
        throw new Error("Full name must be at least 2 characters");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Invalid email format");
      }
      if (formData.phoneNumber && !/^\d{10,12}$/.test(formData.phoneNumber)) {
        throw new Error("Phone number must be 10-12 digits");
      }

      // Chuyển đổi dateOfBirth sang định dạng ISO
      const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : "";

      const response = await updateProfile(userId, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: dateOfBirth,
        address: formData.address,
      });

      // Cập nhật localStorage và context
      const updatedUser = {
        ...storedUser,
        userId,
        fullName: response.data?.fullName || formData.fullName,
        email: response.data?.email || formData.email,
        phoneNumber: response.data?.phoneNumber || formData.phoneNumber,
        dateOfBirth: response.data?.dateOfBirth || formData.dateOfBirth,
        address: response.data?.address || formData.address,
        role: authUser?.role || storedUser?.role,
        profilePictureUrl: authUser?.profilePictureUrl || storedUser?.profilePictureUrl,
        createdAt: authUser?.createdAt || storedUser?.createdAt,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setStoredUser(updatedUser);
      }
      setUser(updatedUser);

      setIsEditing(false);
      setError(null);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving profile");
    }
  };

  const handleChangePassword = async () => {
    try {
      const userId = authUser?.userId || (storedUser?.userId ?? "");
      if (!userId) throw new Error("User ID not found");

      // Validation
      if (passwordData.newPassword.length < 8) {
        setError("New password must be at least 8 characters");
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New password and confirm password do not match");
        return;
      }

      const response = await changePassword(userId, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      setError(null);
      setSuccess("Password changed successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while changing password");
    }
  };

  const handleCancel = () => {
    const userData = authUser || storedUser;
    setFormData({
      fullName: userData?.fullName || "",
      email: userData?.email || "",
      phoneNumber: userData?.phoneNumber || "",
      dateOfBirth: userData?.dateOfBirth || "",
      address: userData?.address || "",
    });
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditing(false);
    setIsChangingPassword(false);
    setError(null);
    setSuccess(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = useMemo(() => getInitials(formData.fullName), [formData.fullName]);
  const profileAvatarUrl = getAvatarUrl(authUser?.profilePictureUrl || storedUser?.profilePictureUrl);
  const shopAvatarUrl = getAvatarUrl(shopImageUrl, DEFAULT_SHOP_AVATAR);
  const currentRole = authUser?.role || storedUser?.role;
  const roleLabel =
    currentRole === UserRole.Shop || currentRole === 2 || currentRole === "shop"
      ? "Shop Owner"
      : currentRole === UserRole.Intermediary || currentRole === 3 || currentRole === "intermediary"
        ? "Intermediary"
        : "Regular User";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={profileAvatarUrl}
                    alt={formData.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-orange-100 p-0">
                    <img src="/placeholder-user.jpg" alt={formData.fullName} className="h-full w-full object-cover" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{formData.fullName}</CardTitle>
                  <CardDescription className="text-lg">{formData.email}</CardDescription>
                  <Badge
                    variant={roleLabel === "Regular User" ? "secondary" : "default"}
                    className="mt-2"
                  >
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm" disabled={error !== null}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <XIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && <p className="text-red-500">{error}</p>}
                  {success && <p className="text-green-500">{success}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.fullName}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <MailIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.phoneNumber || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.address || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="p-2 bg-gray-50 rounded">
                        <Badge
                          variant={roleLabel === "Regular User" ? "secondary" : "default"}
                        >
                          {roleLabel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </div>
                  {!isChangingPassword ? (
                    <Button onClick={() => setIsChangingPassword(true)} variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleChangePassword} size="sm" disabled={error !== null}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <XIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {isChangingPassword && (
                    <>
                      {error && <p className="text-red-500">{error}</p>}
                      {success && <p className="text-green-500">{success}</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="oldPassword">Old Password</Label>
                          <Input
                            id="oldPassword"
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Notification Settings
                  </Button>
                  <Separator />
                  <Button onClick={logout} variant="destructive" className="w-full">
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              {isShopOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shop Profile</CardTitle>
                    <CardDescription>Update your shop avatar shown to customers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={shopAvatarUrl} alt={shopData?.shopName || "Shop"} className="object-cover" />
                        <AvatarFallback className="bg-orange-100 p-0">
                          <img src={DEFAULT_SHOP_AVATAR} alt={shopData?.shopName || "Shop"} className="h-full w-full object-cover" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{shopData?.shopName || "Your shop"}</p>
                        <p className="text-sm text-gray-500">{shopData?.location || "Da Nang"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopImageUrl">Shop avatar URL</Label>
                      <Input
                        id="shopImageUrl"
                        value={shopImageUrl}
                        onChange={(event) => setShopImageUrl(event.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <Button onClick={handleSaveShopImage} className="w-full justify-start">
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Shop Avatar
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isShopOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shop Owner Tools</CardTitle>
                    <CardDescription>Manage your shop and products</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={() => router.push("/dashboard")} className="w-full justify-start">
                      Shop Dashboard
                    </Button>
                    <Button
                      onClick={() => router.push("/shop/upload")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Upload Product
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
