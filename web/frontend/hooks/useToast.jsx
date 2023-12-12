import { Toast } from "@shopify/app-bridge-react";
import { useState } from "react";
import { EMPTY_CONTENT_TOAST } from "../constants/constants";

export const useToast = ({ isLoading }) => {
  const [toastProps, setToastProps] = useState(EMPTY_CONTENT_TOAST);

  const toastMarkup = toastProps.content && !isLoading && (
    <Toast
      {...toastProps}
      onDismiss={() => setToastProps(EMPTY_CONTENT_TOAST)}
    />
  );

  return {
    toastMarkup,
    setToastProps,
  };
};
