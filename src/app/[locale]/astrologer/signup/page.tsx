import { redirect } from "next/navigation";

export default function AstrologerSignupPage() {
    redirect("/login?role=astrologer");
}
