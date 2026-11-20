import Link from "next/link";
export default function Page() {
  return (
    <>
      <h1>You can keep practising.</h1>
      <p>
        The connection is unavailable. Previously opened preview activities may
        be available on this device.
      </p>
      <Link className="button button-primary" href="/preview/index.html">
        Open practice preview
      </Link>
    </>
  );
}
