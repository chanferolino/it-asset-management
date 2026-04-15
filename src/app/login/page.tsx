import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const setting = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <CardHeader className="text-center">
          {setting.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={setting.logoDataUrl}
              alt={setting.siteName}
              className="mx-auto h-20 w-auto max-w-full object-contain"
            />
          ) : (
            <CardTitle className="text-2xl text-[#300000] font-bold tracking-tight">
              {setting.siteName}
            </CardTitle>
          )}
          <CardDescription className="text-[#888888]">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
