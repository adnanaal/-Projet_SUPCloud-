import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { removeToast } from '../../store/uiSlice';

const ToastContainer = () => {
  const dispatch = useDispatch();
  const { toasts } = useSelector((state) => state.ui);

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 5000); // Auto-remove after 5 seconds

      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  const bgColor = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${bgColor[toast.type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-right fade-in duration-300`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
