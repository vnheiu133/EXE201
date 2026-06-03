// components/api/user.tsx
import { User } from "@/types/user";

export const updateProfile = async (userId: string, data: { fullName: string; phoneNumber: string; email: string; dateOfBirth: string; address: string }) => {
    const response = await fetch(`/api/user/update-profile`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json-patch+json",
        accept: "*/*",
        },
        body: JSON.stringify({ ...data, userId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật hồ sơ thất bại");
    }
    return response.json();
};

export const changePassword = async (userId: string, data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await fetch(`/api/user/change-password`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json-patch+json",
        accept: "*/*",
        },
        body: JSON.stringify({ ...data, userId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đổi mật khẩu thất bại");
    }
    return response.json();
};
