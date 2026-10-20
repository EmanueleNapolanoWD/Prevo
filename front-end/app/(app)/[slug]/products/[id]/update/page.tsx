import { getProduct, updateProduct } from "@/lib/Api/Product/product.actions";
import { ProductForm } from "@/components/app/DashboardComponents/Products/ProductForm/ProductForm";
import { notFound } from "next/navigation";
import { toFormValues } from "@/lib/Api/Product/product.schema";

interface UpdateProductsPageProps {
     params: Promise<{ slug: string; id: string }>;
};

export default async function UpdateProductsPage({params}: UpdateProductsPageProps){

    const {slug,id} = await params;

    const result = await getProduct(slug,id);

    if (!("data" in result)) notFound();

    const product = result.data;

    const categories = [];

    return (
        <>
          <ProductForm
          key={product.id}
            mode="update"
            slug={slug}
            defaultValues={toFormValues(product)}
            categories={categories}
            onSubmit={updateProduct.bind(null, slug, id)}
          />
        </>
      );
}