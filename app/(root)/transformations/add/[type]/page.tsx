import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const AddTransformationTypePage = async ({
  params: { type },
}: SearchParamProps) => {
  // Authenticate user
  const { userId } = await auth();

  if (!userId) {
    // Redirect to sign-in if not authenticated
    redirect("/sign-in");
    return null; // Return null to prevent the rest of the page from rendering
  }

  // Ensure transformation type exists
  const transformation =
    transformationTypes[type as keyof typeof transformationTypes];

  if (!transformation) {
    // Handle the case where the transformation type is invalid
    redirect("/error"); // Or render an error message
    return null;
  }

  // Fetch user data
  const user = await getUserById(userId);

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
