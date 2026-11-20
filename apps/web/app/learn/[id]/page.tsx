import { ContentReader } from "../../../components/learning";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContentReader id={id} />;
}
