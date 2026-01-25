import { toast } from "react-toastify";

export const handleSuccess = (msg) => {
  toast.success(msg, {
    position: "top-center",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    style: {
      background: "linear-gradient(135deg, #d4fc79, #96e6a1)",
      color: "#1B1B1B",
      fontWeight: "600",
      borderRadius: "12px",
      padding: "14px 18px",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
      fontSize: "16px",
    }
  });
};

export const handleError = (msg) => {
  toast.error(msg, {
    position: "top-center",
    autoClose: 2800,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    style: {
      background: "linear-gradient(135deg, #ff9a9e, #fecfef)",
      color: "#1B1B1B",
      fontWeight: "600",
      borderRadius: "12px",
      padding: "14px 18px",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
      fontSize: "16px",
    }
  });
};
