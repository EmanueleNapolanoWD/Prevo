import { ProductForm } from "@/components/app/DashboardComponents/Products/ProductForm/ProductForm";
import { createProduct } from "@/lib/Api/Product/product.actions";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const categories = [];

  return (
    <>
      <ProductForm
        mode="create"
        slug={slug}
        categories={categories}
        onSubmit={createProduct.bind(null, slug)}
      />
    </>
  );
}
