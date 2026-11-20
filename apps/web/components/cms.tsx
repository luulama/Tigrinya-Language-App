"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "@polyglot/ui";
import {
  contentKinds,
  type ContentItem,
  type ContentKind,
} from "@polyglot/shared-types";
import { approvalScopes, contentSchema } from "@polyglot/content-engine";
import { request } from "../lib/api";
import { QueryState } from "./learning";
export function ContentManager({ reviewer = false }: { reviewer?: boolean }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [file, setFile] = useState<File | null>(null);
  const query = useQuery({
    queryKey: ["cms", offset, filter],
    queryFn: () =>
      request<ContentItem[]>(
        `/api/admin/content?offset=${offset}${filter === "all" ? "" : "&kind=" + filter}`,
        {},
        true,
      ),
    retry: false,
  });
  const [selected, setSelected] = useState<ContentItem | null>(null),
    [title, setTitle] = useState(""),
    [kind, setKind] = useState<ContentKind>("Word"),
    [payload, setPayload] = useState("{}"),
    [notes, setNotes] = useState(""),
    [scope, setScope] = useState<(typeof approvalScopes)[number]>("Language"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  function choose(item: ContentItem) {
    setPreviewUrl(null);
    setSelected(item);
    setTitle(item.title);
    setKind(item.kind);
    setPayload(JSON.stringify(item.payload, null, 2));
    setMessage("");
  }
  async function preview() {
    if (!selected) return;
    setBusy(true);
    try {
      const blob = await request<Blob>(
        `/api/admin/assets/${selected.id}/file`,
        {},
        true,
        "blob",
      );
      setPreviewUrl(URL.createObjectURL(blob));
      setMessage("Private review preview. This file is not published.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload() {
    if (!selected || !file) return;
    setBusy(true);
    try {
      const digest = [
        ...new Uint8Array(
          await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
        ),
      ]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (
        !extension ||
        !["mp3", "wav", "png", "jpg", "jpeg", "webp", "mp4"].includes(extension)
      )
        throw Error("Choose a supported audio, image or video file.");
      const fields = {
        ...JSON.parse(payload),
        sha256: digest,
        blobName: `${selected.id}/${crypto.randomUUID()}.${extension}`,
      };
      const updated = await request<ContentItem>(
        `/api/admin/content/${selected.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title,
            payload: fields,
            concurrencyStamp: selected.concurrencyStamp,
          }),
        },
        true,
      );
      choose(updated);
      await request(
        `/api/admin/assets/${selected.id}/file`,
        { method: "PUT", body: file },
        true,
      );
      setMessage(
        "File uploaded as an immutable draft asset. Review is still required.",
      );
      await query.refetch();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      const value = contentSchema.parse({
        languageTag: selected?.languageTag ?? "ti",
        kind,
        title,
        payload: JSON.parse(payload),
      });
      if (selected) {
        const item = await request<ContentItem>(
          `/api/admin/content/${selected.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              title: value.title,
              payload: value.payload,
              concurrencyStamp: selected.concurrencyStamp,
            }),
          },
          true,
        );
        choose(item);
      } else {
        const response = await request<{ id: string }>(
          "/api/admin/content",
          { method: "POST", body: JSON.stringify(value) },
          true,
        );
        setMessage("Draft created. It is not available to learners.");
        const result = await request<{ item: ContentItem }>(
          `/api/admin/content/${response.id}`,
          {},
          true,
        );
        choose(result.item);
      }
      await query.refetch();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function action(name: string, approved?: boolean) {
    if (!selected) return;
    setBusy(true);
    try {
      const item = await request<ContentItem>(
        `/api/admin/content/${selected.id}/actions`,
        {
          method: "POST",
          body: JSON.stringify({
            action: name,
            concurrencyStamp: selected.concurrencyStamp,
            scope,
            approved,
            notes,
          }),
        },
        true,
      );
      choose(item);
      setMessage(`Content is now ${item.state}.`);
      await query.refetch();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="eyebrow">Authorised content workspace</p>
      <h1>{reviewer ? "Review content." : "Create and publish content."}</h1>
      <p>
        Every language item and media association needs qualified review.
        Authors cannot approve their own work. Publishing requires all scopes
        and published dependencies.
      </p>
      <QueryState pending={query.isPending} error={query.error} />
      {!query.error && (
        <>
          <div className="actions">
            <Button
              variant="outline"
              onClick={() => {
                setSelected(null);
                setTitle("");
                setPayload("{}");
                setMessage("");
              }}
            >
              New draft
            </Button>
          </div>
          <div className="grid">
            <Card>
              <h2>{selected ? "Edit content" : "Create a draft"}</h2>
              <label>
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </label>
              <label>
                Content type
                <select
                  value={kind}
                  disabled={!!selected}
                  onChange={(e) => setKind(e.target.value as ContentKind)}
                >
                  {contentKinds.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Content fields (JSON)
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  spellCheck={false}
                />
              </label>
              <p className="small">
                Fields are validated against the selected content type. Preserve
                sources, attribution and acceptable variants.
              </p>
              <Button
                disabled={
                  busy ||
                  !title ||
                  (!!selected &&
                    !["Draft", "NeedsRevision"].includes(selected.state))
                }
                onClick={save}
              >
                Save draft
              </Button>
            </Card>
            <Card>
              <h2>Review and publication</h2>
              {selected &&
                ["AudioAsset", "ImageAsset", "VideoAsset"].includes(
                  selected.kind,
                ) && (
                  <>
                    <Button variant="outline" disabled={busy} onClick={preview}>
                      Preview uploaded file
                    </Button>
                    {previewUrl &&
                      (selected.kind === "AudioAsset" ? (
                        <audio
                          controls
                          src={previewUrl}
                          aria-label="Private recording preview"
                        />
                      ) : selected.kind === "VideoAsset" ? (
                        <video
                          controls
                          src={previewUrl}
                          aria-label="Private video preview"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt={String(
                            selected.payload.altText ??
                              "Private draft illustration",
                          )}
                        />
                      ))}
                  </>
                )}

              {selected &&
                ["AudioAsset", "ImageAsset", "VideoAsset"].includes(
                  selected.kind,
                ) && (
                  <div>
                    <label>
                      Draft media file
                      <input
                        type="file"
                        accept="audio/mpeg,audio/wav,image/png,image/jpeg,image/webp,video/mp4"
                        onChange={(event) =>
                          setFile(event.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <Button
                      variant="outline"
                      disabled={
                        busy ||
                        !file ||
                        !["Draft", "NeedsRevision"].includes(selected.state)
                      }
                      onClick={upload}
                    >
                      Upload draft file
                    </Button>
                  </div>
                )}
              <p>
                State: <strong>{selected?.state ?? "New draft"}</strong>
              </p>
              {selected && <p>Revision {selected.revision}</p>}
              <label>
                Review scope
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as typeof scope)}
                >
                  {approvalScopes.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Decision notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={4000}
                />
              </label>
              <div className="actions">
                <Button
                  variant="outline"
                  disabled={busy || !selected}
                  onClick={() => action("submit")}
                >
                  Submit
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !selected}
                  onClick={() => action("review")}
                >
                  Start review
                </Button>
                <Button
                  disabled={busy || !selected || !notes}
                  onClick={() => action("decide", true)}
                >
                  Approve scope
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !selected || !notes}
                  onClick={() => action("decide", false)}
                >
                  Request revision
                </Button>
                <Button
                  disabled={busy || selected?.state !== "Approved"}
                  onClick={() => action("publish")}
                >
                  Publish
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !selected}
                  onClick={() => action("revise")}
                >
                  Create revision
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !selected}
                  onClick={() => action("archive")}
                >
                  Archive
                </Button>
              </div>
              <p className="small">
                The server checks roles, reviewer qualifications, version hashes
                and author independence for every action.
              </p>
            </Card>
          </div>
          <p role="status" className="notice">
            {message || "Select a draft below or create new content."}
          </p>
          <label>
            Content queue
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setOffset(0);
              }}
            >
              <option value="all">All content</option>
              {contentKinds.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="table-wrap">
            <table>
              <caption>Content revisions in your authorised queue</caption>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>State</th>
                  <th>Revision</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {query.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.kind}</td>
                    <td>{item.state}</td>
                    <td>{item.revision}</td>
                    <td>
                      <Button variant="outline" onClick={() => choose(item)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="actions">
            <Button
              variant="outline"
              disabled={offset === 0 || query.isFetching}
              onClick={() => setOffset(Math.max(0, offset - 50))}
            >
              Previous page
            </Button>
            <Button
              variant="outline"
              disabled={(query.data?.length ?? 0) < 50 || query.isFetching}
              onClick={() => setOffset(offset + 50)}
            >
              Next page
            </Button>
          </div>
        </>
      )}
    </>
  );
}
