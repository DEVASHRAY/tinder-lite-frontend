"use client";

export interface LoginActionState {
  message: string;
  success: boolean;
}

export const initialLoginActionState: LoginActionState = {
  message: "",
  success: false,
};

export const loginAction = async (
  previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return {
      ...previousState,
      message: "Email and password are required",
      success: false,
    };
  }

  try {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    if (!response.ok) {
      return {
        ...previousState,
        message:
          response.status === 401
            ? "Invalid email or password"
            : "Unable to log in",
        success: false,
      };
    }

    return {
      message: "Login successful",
      success: true,
    };
  } catch (error) {
    return {
      ...previousState,
      message:
        error instanceof Error
          ? "Unable to reach the authentication service"
          : "Unexpected login failure",
      success: false,
    };
  }
};

/*
 * Learning notes
 *
 * React 19 Action
 * - An Action is an async function submitted by a form through `useActionState`.
 * - React supplies `previousState` and `FormData` as positional parameters, so
 *   this function follows React's API instead of the project's named-input rule.
 * - The same-origin browser request stores the HTTP-only login cookie without
 *   exposing its value to JavaScript.
 *
 * React 18.2 comparison
 * - React 18 commonly used `onSubmit`, `preventDefault`, and separate state for
 *   pending, success, and error handling.
 * - React 19 lets the form and Action participate in one submission lifecycle.
 */
