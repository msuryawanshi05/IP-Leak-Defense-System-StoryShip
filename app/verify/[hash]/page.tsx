import PublicVerifyPage from "./VerifyClient"

export function generateStaticParams() {
  return [{ hash: "demo" }]
}

export default function Page() {
  return <PublicVerifyPage />
}
