import { NextResponse } from "next/server";
import { getAuthEnv, setSession, timingSafeEqual } from "@/lib/auth/aphrodite-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, password } = body;

    const env = getAuthEnv();

    if (!env.isConfigured || !env.login || !env.password || !env.secret) {
      return NextResponse.json(
        { error: "Авторизация не настроена" },
        { status: 500 }
      );
    }

    if (!login || !password) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // Use timing-safe equal to prevent timing attacks, though standard equality is common here
    const isLoginValid = timingSafeEqual(login, env.login);
    const isPasswordValid = timingSafeEqual(password, env.password);

    if (isLoginValid && isPasswordValid) {
      await setSession(env.secret);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
