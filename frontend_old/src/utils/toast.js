import toast from "react-hot-toast";

export const showSuccessToast = (message) => {
    toast.success(message, {
        icon: "✅",
    });
};

export const showErrorToast = (message) => {
    toast.error(message, {
        icon: "❌",
    });
};

export const showLoadingToast = (message) => {
    return toast.loading(message, {
        icon: "⏳",
    });
};

export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};
