import { toast } from 'react-toastify'

const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
}

export const Toast = {
    success: (mes) => toast.success(mes, toastConfig),
    error: (mes) => toast.error(mes, toastConfig)
} 