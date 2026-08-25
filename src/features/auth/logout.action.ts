"use client";

export interface LogoutActionState {
  message: string;
  success: boolean;
}

export const initialLogoutActionState: LogoutActionState = {
  message: "",
  success: false,
};

export const logoutAction = async (
  previousState: LogoutActionState,
  formData: FormData,
): Promise<LogoutActionState> => {
  if (formData.get("intent") !== "logout") {
    return {
      ...previousState,
      message: "Invalid logout request",
      success: false,
    };
  }

  try {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      return {
        ...previousState,
        message: "Unable to log out",
        success: false,
      };
    }

    return {
      message: "",
      success: true,
    };
  } catch (error) {
    return {
      ...previousState,
      message:
        error instanceof Error
          ? "Unable to reach the authentication service"
          : "Unexpected logout failure",
      success: false,
    };
  }
};

/*
 * Learning notes
 *
 * React 19 Action
 * - The logout form submits this async mutation through `useActionState`, keeping
 *   its result in React's form lifecycle while Express clears the HTTP-only cookie.
 *
 * React 18.2 comparison
 * - React 18 commonly used an `onClick` handler plus separate request, pending,
 *   error, and navigation state.
 */
