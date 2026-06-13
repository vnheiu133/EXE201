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
import { getShopByUserId, updateShopImage, uploadShopImage } from "@/components/api/shop";
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
  const [uploadingShopImage, setUploadingShopImage] = useState(false);

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
      if (!shopData?.shopId) throw new Error("Không tìm thấy cửa hàng");
      if (!shopImageUrl.trim()) throw new Error("Vui lòng nhập URL ảnh cửa hàng");

      const response = await updateShopImage(shopData.shopId, shopImageUrl.trim());
      if (!response.success) throw new Error(response.message || "Cập nhật ảnh cửa hàng thất bại");

      setShopData(response.data);
      setError(null);
      setSuccess("Cập nhật ảnh cửa hàng thành công");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật ảnh cửa hàng");
    }
  };

  const handleUploadShopImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingShopImage(true);
    setError(null);
    setSuccess(null);

    try {
      if (!shopData?.shopId) throw new Error("Không tìm thấy cửa hàng");
      const response = await uploadShopImage(shopData.shopId, file);
      if (!response.success) throw new Error(response.message || "Tải ảnh lên thất bại");

      setShopData(response.data);
      setShopImageUrl(response.data.shopImageUrl || "");
      setSuccess("Tải ảnh cửa hàng lên thành công!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải ảnh lên");
    } finally {
      setUploadingShopImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userId = authUser?.userId || (storedUser?.userId ?? "");
      if (!userId) throw new Error("Không tìm thấy mã người dùng");

      // Validation
      if (!formData.fullName || formData.fullName.length < 2) {
        throw new Error("Họ và tên phải có ít nhất 2 ký tự");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Email không đúng định dạng");
      }
      if (formData.phoneNumber && !/^\d{10,12}$/.test(formData.phoneNumber)) {
        throw new Error("Số điện thoại phải có 10-12 chữ số");
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
      setSuccess("Cập nhật hồ sơ thành công");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu hồ sơ");
    }
  };

  const handleChangePassword = async () => {
    try {
      const userId = authUser?.userId || (storedUser?.userId ?? "");
      if (!userId) throw new Error("Không tìm thấy mã người dùng");

      // Validation
      if (passwordData.newPassword.length < 8) {
        setError("Mật khẩu mới phải có ít nhất 8 ký tự");
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
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
      setSuccess("Đổi mật khẩu thành công");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi đổi mật khẩu");
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
      ? "Chủ cửa hàng"
      : currentRole === UserRole.Intermediary || currentRole === 3 || currentRole === "intermediary"
        ? "Trung gian"
        : "Người dùng";

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
                  <Badge variant={roleLabel === "Người dùng" ? "secondary" : "default"} className="mt-2">
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
                    <CardTitle>Thông tin hồ sơ</CardTitle>
                    <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm" disabled={error !== null}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <XIcon className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && <p className="text-red-500">{error}</p>}
                  {success && <p className="text-green-500">{success}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
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
                      <Label htmlFor="email">Địa chỉ email</Label>
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
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      {isEditing ? (
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.phoneNumber || "Chưa cung cấp"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Ngày sinh</Label>
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
                          <span>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cung cấp"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          <span>{formData.address || "Chưa cung cấp"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Loại tài khoản</Label>
                      <div className="p-2 bg-gray-50 rounded">
                        <Badge variant={roleLabel === "Người dùng" ? "secondary" : "default"}>
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
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>Cập nhật mật khẩu tài khoản của bạn</CardDescription>
                  </div>
                  {!isChangingPassword ? (
                    <Button onClick={() => setIsChangingPassword(true)} variant="outline" size="sm">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Đổi
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleChangePassword} size="sm" disabled={error !== null}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <XIcon className="w-4 h-4 mr-2" />
                        Hủy
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
                          <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                          <Input
                            id="oldPassword"
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Mật khẩu mới</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
                  <CardTitle>Thao tác tài khoản</CardTitle>
                  <CardDescription>Quản lý cài đặt tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Đổi mật khẩu
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Cài đặt quyền riêng tư
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Cài đặt thông báo
                  </Button>
                  <Separator />
                  <Button onClick={logout} variant="destructive" className="w-full">
                    Đăng xuất
                  </Button>
                </CardContent>
              </Card>

              {isShopOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hồ sơ cửa hàng</CardTitle>
                    <CardDescription>Cập nhật ảnh đại diện cửa hàng hiển thị với khách hàng</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={shopAvatarUrl} alt={shopData?.shopName || "Cửa hàng"} className="object-cover" />
                        <AvatarFallback className="bg-orange-100 p-0">
                          <img src={DEFAULT_SHOP_AVATAR} alt={shopData?.shopName || "Cửa hàng"} className="h-full w-full object-cover" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{shopData?.shopName || "Cửa hàng của bạn"}</p>
                        <p className="text-sm text-gray-500">{shopData?.location || "Da Nang"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopImageUrl">Ảnh đại diện cửa hàng *</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="shopImageUrl"
                          type="file"
                          accept="image/*"
                          onChange={handleUploadShopImage}
                          disabled={uploadingShopImage}
                          className="cursor-pointer"
                        />
                        {uploadingShopImage && (
                          <p className="text-xs text-emerald-600 animate-pulse font-medium">
                            Đang tải ảnh lên Cloudinary...
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isShopOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Công cụ chủ cửa hàng</CardTitle>
                    <CardDescription>Quản lý cửa hàng và sản phẩm của bạn</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={() => router.push("/dashboard")} className="w-full justify-start">
                      Bảng điều khiển cửa hàng
                    </Button>
                    <Button
                      onClick={() => router.push("/shop/upload")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Đăng sản phẩm
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
