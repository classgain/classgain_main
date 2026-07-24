import { useEffect, useState } from "react";
import { Alert, Badge, Container, Spinner } from "react-bootstrap";
import logo from "./assets/navbarlogo_adminpage.png";

const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const categories = [
  "Books & Notes",
  "Writing Things",
  "Electronics",
  "Toys",
  "Story Books",
  "School Bags",
];
const emptyProduct = {
  name: "",
  category: "Books & Notes",
  description: "",
  price: "",
  discount: "0",
  fastDelivery: false,
  smoothDelivery: false,
  stock: "0",
  brand: "",
  rating: "0",
  status: true,
  images: [],
};
const RETRYABLE_BACKEND_STATUSES = new Set([502, 503, 504]);
const JSON_BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

async function request(path, options = {}, attempt = 0) {
  const requestOptions = { ...options };
  const method = (requestOptions.method || "GET").toUpperCase();
  const headers = new Headers(requestOptions.headers || {});
  if (JSON_BODY_METHODS.has(method) && requestOptions.body == null) {
    requestOptions.body = JSON.stringify({});
  }
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API}${path}`, {
    cache: "no-store",
    credentials: "include",
    ...requestOptions,
    headers,
  });

  if (
    RETRYABLE_BACKEND_STATUSES.has(response.status) &&
    attempt < 2 &&
    method === "GET"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    return request(path, requestOptions, attempt + 1);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const unavailable = RETRYABLE_BACKEND_STATUSES.has(response.status);
    throw new Error(
      data.message ||
        (unavailable
          ? "The backend is temporarily unavailable. Check the Render service and its environment variables, then try again."
          : `Backend returned ${response.status}`),
    );
  }
  return data;
}

function StudentCounselling({ notify }) {
  const [items,setItems] = useState([]), [counts,setCounts] = useState({}), [loading,setLoading] = useState(true), [search,setSearch] = useState(""), [status,setStatus] = useState(""), [priority,setPriority] = useState(""), [selected,setSelected] = useState(null), [reply,setReply] = useState(""), [notes,setNotes] = useState(""), [submitting,setSubmitting] = useState(false);
  const load = () => { setLoading(true); const query = new URLSearchParams({ ...(search && {search}), ...(status && {status}), ...(priority && {priority}), limit:"50" }); return request(`/admin/counselling?${query}`).then((d) => { setItems(d.items || []); setCounts(d.counts || {}); }).catch((e) => notify("error",e.message)).finally(() => setLoading(false)); };
  useEffect(() => { const timer = setTimeout(load,250); return () => clearTimeout(timer); }, [search,status,priority]);
  const update = async (item, values) => { try { const data = await request(`/admin/counselling/${item._id}`, {method:"PUT",body:JSON.stringify(values)}); notify("success",data.message); setSelected((current) => current?._id === item._id ? data.item : current); load(); return true; } catch(e) { notify("error",e.message); return false; } };
  const remove = async (item) => { if (!confirm(`Delete counselling request from ${item.name}?`)) return; try { const data = await request(`/admin/counselling/${item._id}`,{method:"DELETE"}); notify("success",data.message); setSelected(null); load(); } catch(e) { notify("error",e.message); } };
  const open = (item) => { setSelected(item); setReply(item.adminReply || ""); setNotes(item.adminNotes || ""); };
  const submitResponse = async (event) => {
    event.preventDefault();
    if (!reply.trim()) {
      notify("error", "Enter an admin response before submitting.");
      return;
    }
    setSubmitting(true);
    const saved = await update(selected, { adminReply: reply.trim(), adminNotes: notes.trim() });
    setSubmitting(false);
    if (saved) setSelected(null);
  };
  const imageUrl = selected?.image ? `${API.replace(/\/api$/, "")}${selected.image}` : "";
  return <AdminSection title="Student Counselling" subtitle="Review, reply to, and track every student counselling request."><div className="admin-metrics">{["Total","Pending","In Progress","Resolved","Closed"].map((label) => <article key={label}><span>{label}</span><strong>{label === "Total" ? Object.values(counts).reduce((a,b) => a+b,0) : counts[label] || 0}</strong><p>Counselling requests</p></article>)}</div><div className="admin-toolbar counselling-filters"><input placeholder="Search student, ID, department or category" value={search} onChange={(e)=>setSearch(e.target.value)}/><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All statuses</option>{["Pending","In Progress","Resolved","Closed"].map(x=><option key={x}>{x}</option>)}</select><select value={priority} onChange={(e)=>setPriority(e.target.value)}><option value="">All priorities</option>{["Low","Medium","High","Urgent"].map(x=><option key={x}>{x}</option>)}</select></div>{loading ? <Spinner animation="border"/> : <Table headers={["Student","Student ID","Department","Subject","Category","Status","Priority","Date","Actions"]} rows={items.map((item)=>[item.name,item.studentId,item.department,item.subject,item.category,<select value={item.status} onChange={(e)=>update(item,{status:e.target.value})}>{["Pending","In Progress","Resolved","Closed"].map(x=><option key={x}>{x}</option>)}</select>,<select value={item.priority} onChange={(e)=>update(item,{priority:e.target.value})}>{["Low","Medium","High","Urgent"].map(x=><option key={x}>{x}</option>)}</select>,date(item.createdAt),<Actions><button onClick={()=>open(item)}>View / Reply</button><button onClick={()=>remove(item)}>Delete</button></Actions>])}/>} {selected && <div className="admin-modal-backdrop" onMouseDown={()=>setSelected(null)}><section className="admin-detail-panel admin-detail-modal counselling-modal" onMouseDown={(event)=>event.stopPropagation()}><div className="admin-detail-panel__header"><div><span>Student counselling request</span><h2>{selected.subject}</h2></div><button type="button" onClick={()=>setSelected(null)}>Close</button></div><div className="admin-detail-grid counselling-details-grid"><div><span>Student</span><strong>{selected.name}</strong></div><div><span>Student ID</span><strong>{selected.studentId}</strong></div><div><span>Contact</span><strong>{selected.email}<br/>{selected.phone}</strong></div><div><span>Department</span><strong>{selected.department}</strong></div><div><span>Semester</span><strong>{selected.semester}</strong></div><div><span>Category</span><strong>{selected.category}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Priority</span><strong>{selected.priority}</strong></div><div><span>Submitted</span><strong>{date(selected.createdAt)}</strong></div></div><div className="counselling-modal__content"><article><h3>Complete problem details</h3><p className="counselling-description">{selected.description}</p>{imageUrl ? <><h3>Uploaded image</h3><button type="button" className="counselling-image-button" onClick={()=>window.open(imageUrl,"_blank","noopener,noreferrer")}><img className="admin-counselling-image" src={imageUrl} alt={`Uploaded evidence for ${selected.subject}`}/><span>Click image to open full size</span></button></> : <p className="admin-empty-state">No image was uploaded.</p>}</article><form className="counselling-response-form" onSubmit={submitResponse}><h3>Admin response</h3><label>Response to student<textarea rows="6" required value={reply} onChange={(e)=>setReply(e.target.value)} placeholder="Write the response the student will receive..."/></label><label>Private admin notes<textarea rows="4" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Optional notes visible only to admins"/></label><div className="admin-popup-actions"><button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send response"}</button><button type="button" className="danger" disabled={submitting} onClick={()=>remove(selected)}>Delete request</button></div></form></div></section></div>}</AdminSection>;
}
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "-";

function EducationCenters({ notify }) {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [selected, setSelected] = useState(null);
  const load = () =>
    request("/admin/education-centers")
      .then((d) => setItems(d.items || []))
      .catch((e) => notify("error", e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const action = async (id, type) => {
    if (type === "delete" && !confirm("Delete this education center?")) return;
    try {
      const d = await request(
        `/admin/education-center/${id}${type === "delete" ? "" : `/${type}`}`,
        { method: type === "delete" ? "DELETE" : "PATCH" },
      );
      notify("success", d.message);
      const changed = d.educationCenter;
      setItems((current) => type === "delete" ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id && changed ? changed : item));
      setSelected((current) => current?.id === id ? (type === "delete" ? null : changed || current) : current);
    } catch (e) {
      notify("error", e.message);
    }
  };
  const visible = items.filter(
    (x) =>
      (status === "All" || x.status === status) &&
      (!search ||
        [x.educationCenterName, x.email, x.city, x.phone].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase()),
        )),
  );
  const count = (value) => items.filter((x) => x.status === value).length;
  return (
    <>
      <section className="admin-hero">
        <Container fluid="xl">
          <div className="admin-hero__content">
            <Badge bg="success" className="admin-badge">
              Approval System
            </Badge>
            <h1>Review education center registrations.</h1>
            <p>
              Approve, reject, view, and remove education centers before they
              can sign in or appear on the client portal.
            </p>
          </div>
        </Container>
      </section>
      <AdminSection
        title="Education Centers"
        subtitle="Manage all education-center approval requests."
      >
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            <div className="admin-metrics">
              <article>
                <span>Total Centers</span>
                <strong>{items.length}</strong>
                <p>All registration requests</p>
              </article>
              <article>
                <span>Pending</span>
                <strong>{count("Pending")}</strong>
                <p>Waiting for admin review</p>
              </article>
              <article>
                <span>Approved</span>
                <strong>{count("Approved")}</strong>
                <p>Visible to clients</p>
              </article>
              <article><span>On Hold</span><strong>{count("Held")}</strong><p>Account access paused</p></article>
            </div>
            <div className="admin-toolbar">
              <div>
                <span>Education Centers</span>
                <strong>{visible.length}</strong>
              </div>
              <label>
                <span>Search</span>
                <input
                  placeholder="Name, phone, email, city"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {["All", "Pending", "Approved", "Held", "Rejected"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <Table
              headers={[
                "Education Center Name",
                "Category",
                "Phone",
                "Email",
                "Status",
                "Created Date",
                "Actions",
              ]}
              rows={visible.map((x) => [
                x.educationCenterName,
                x.category,
                x.phone,
                x.email,
                <Badge
                  bg={
                    x.status === "Approved"
                      ? "success"
                      : x.status === "Rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {x.status}
                </Badge>,
                date(x.createdAt),
                <Actions>
                  <button onClick={() => setSelected(x)}>View</button>
                  <label className="admin-status-toggle"><input type="checkbox" checked={x.status === "Approved"} onChange={(event) => action(x.id, event.target.checked ? "approve" : "pending")}/><span>Pending to approval</span></label>
                  <label className="admin-status-toggle admin-status-toggle--hold"><input type="checkbox" checked={x.status === "Held"} onChange={(event) => action(x.id, event.target.checked ? "hold" : "approve")}/><span>Account hold</span></label>
                  <button
                    className="danger"
                    onClick={() => action(x.id, "delete")}
                  >
                    Delete
                  </button>
                </Actions>,
              ])}
            />
            {selected && (
              <div className="admin-modal-backdrop" onMouseDown={() => setSelected(null)}>
              <section className="admin-detail-panel admin-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
                <div className="admin-detail-panel__header">
                  <div>
                    <span>Selected Center</span>
                    <h2>{selected.educationCenterName}</h2>
                  </div>
                  <Badge
                    bg={selected.status === "Approved" ? "success" : "warning"}
                  >
                    {selected.status}
                  </Badge>
                  <button onClick={() => setSelected(null)}>Close</button>
                </div>
                <div className="admin-detail-grid">
                  <div>
                    <span>Owner</span>
                    <strong>{selected.ownerName}</strong>
                  </div>
                  <div>
                    <span>Category</span>
                    <strong>{selected.category}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{selected.phone}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{selected.email}</strong>
                  </div>
                  <div>
                    <span>Address</span>
                    <strong>
                      {[
                        selected.address,
                        selected.city,
                        selected.state,
                        selected.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </strong>
                  </div>
                  <div>
                    <span>Username</span>
                    <strong>{selected.username}</strong>
                  </div>
                </div>
                <div className="admin-popup-actions"><button onClick={() => action(selected.id, selected.status === "Approved" ? "pending" : "approve")}>{selected.status === "Approved" ? "Move to Pending" : "Approve and publish"}</button><button onClick={() => action(selected.id, selected.status === "Held" ? "approve" : "hold")}>{selected.status === "Held" ? "Release account" : "Hold account"}</button><button className="danger" onClick={() => action(selected.id,"delete")}>Delete</button></div>
              </section>
              </div>
            )}
          </>
        )}
      </AdminSection>
    </>
  );
}

function SupportTickets({ notify }) {
  const [type, setType] = useState("student"),
    [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState(null),
    [response, setResponse] = useState("");
  const load = () => {
    setLoading(true);
    return request(`/support-tickets/admin/${type}`)
      .then((d) => setItems(d.items || []))
      .catch((e) => notify("error", e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [type]);
  const update = async (ticket, patch) => {
    try {
      await request(`/support-tickets/admin/${type}/${ticket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      notify("success", "Ticket updated.");
      load();
    } catch (e) {
      notify("error", e.message);
    }
  };
  const remove = async (ticket) => {
    if (!confirm("Delete this support ticket?")) return;
    try {
      await request(`/support-tickets/admin/${type}/${ticket._id}`, {
        method: "DELETE",
      });
      notify("success", "Ticket deleted.");
      load();
    } catch (e) {
      notify("error", e.message);
    }
  };
  const reply = (ticket) => {
    setSelected(ticket);
    setResponse(ticket.reply || "");
  };
  return (
    <AdminSection
      title="Support Tickets"
      subtitle="Student and education center requests in one workspace."
    >
      <div className="admin-tabs">
        <button
          className={type === "student" ? "active" : ""}
          onClick={() => setType("student")}
        >
          Student Support
        </button>
        <button
          className={type === "education-center" ? "active" : ""}
          onClick={() => setType("education-center")}
        >
          Education Center Support
        </button>
      </div>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table
          headers={
            type === "student"
              ? [
                  "Ticket ID",
                  "Student",
                  "Email",
                  "Subject",
                  "Message",
                  "Status",
                  "Created",
                  "Actions",
                ]
              : [
                  "Ticket ID",
                  "Center",
                  "Owner",
                  "Email",
                  "Subject",
                  "Message",
                  "Status",
                  "Created",
                  "Actions",
                ]
          }
          rows={items.map((t) => {
            const common = [
              t.ticketId || t.ticket_id,
              type === "student" ? t.studentName : t.education_center_name,
              ...(type === "student" ? [] : [t.owner_name || "-"]),
              t.email,
              t.subject,
              t.message || t.full_details || t.how_can_we_help,
              <select
                value={t.status}
                onChange={(e) => update(t, { status: e.target.value })}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>,
              date(t.createdAt || t.created_at),
              <Actions>
                <button onClick={() => reply(t)}>View / Respond</button>
                <button onClick={() => update(t, { status: "Closed" })}>
                  Close
                </button>
                <button className="danger" onClick={() => remove(t)}>
                  Delete
                </button>
              </Actions>,
            ];
            return common;
          })}
        />
      )}
      {selected && <div className="admin-modal-backdrop" onMouseDown={() => setSelected(null)}><section className="admin-detail-panel admin-detail-modal" onMouseDown={(event) => event.stopPropagation()}><div className="admin-detail-panel__header"><div><span>{selected.ticketId || selected.ticket_id}</span><h2>{selected.subject}</h2></div><button onClick={() => setSelected(null)}>Close</button></div><p><b>From:</b> {type === "student" ? selected.studentName : selected.education_center_name} · {selected.email}</p><h3>Complete request</h3><p>{selected.message || selected.full_details || selected.how_can_we_help}</p><label>Admin response<textarea rows="5" value={response} onChange={(event) => setResponse(event.target.value)} /></label><div className="admin-popup-actions">{["Open","In Progress","Closed"].map((value) => <button key={value} onClick={() => { update(selected, { reply: response, status: value }); setSelected(null); }}>{value === "Closed" ? "Problem Solved" : value}</button>)}</div><button onClick={() => { update(selected, { reply: response, status: "In Progress" }); setSelected(null); }}>Submit Response</button></section></div>}
    </AdminSection>
  );
}

function Products({ notify }) {
  const [items, setItems] = useState([]),
    [form, setForm] = useState(emptyProduct),
    [editing, setEditing] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    return request(
      `/products?status=all&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&page=${page}&limit=8`,
    )
      .then((d) => {
        setItems(d.items || []);
        setPages(d.pagination?.pages || 1);
      })
      .catch((e) => notify("error", e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [search, category, page]);
  const change = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox" ? checked : type === "file" ? Array.from(files).slice(0, 5) : value,
    }));
  };
  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "images") {
        v.forEach((file) => data.append("images", file));
      } else if (v !== null) {
        data.append(k, v);
      }
    });
    try {
      const d = await request(
        `/admin/products${editing ? `/${editing}` : ""}`,
        { method: editing ? "PUT" : "POST", body: data },
      );
      notify("success", d.message);
      setForm(emptyProduct);
      setEditing("");
      load();
    } catch (err) {
      notify("error", err.message);
    }
  };
  const edit = (p) => {
    setEditing(p._id);
    setForm({
      ...p,
      images: [],
      price: String(p.price),
      discount: String(p.discount),
      stock: String(p.stock),
      rating: String(p.rating),
    });
    scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      const d = await request(`/admin/products/${p._id}`, { method: "DELETE" });
      notify("success", d.message);
      load();
    } catch (e) {
      notify("error", e.message);
    }
  };
  const final =
    (Number(form.price) || 0) * (1 - (Number(form.discount) || 0) / 100);
  return (
    <AdminSection
      title="Ecommerce Products"
      subtitle="Add, edit, search, filter, and publish storefront inventory."
    >
      <form className="product-form" onSubmit={submit}>
        <input
          name="images"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          onChange={change}
          required={!editing}
        />
        <small className="product-form__image-help">Choose 1–5 JPG, JPEG, or PNG photos (maximum 2 MB each). The first photo appears on storefront cards.</small>
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={change}
          required
        />
        <select name="category" value={form.category} onChange={change}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={change}
          required
        />
        <input
          name="price"
          type="number"
          min="0"
          step=".01"
          placeholder="Original price"
          value={form.price}
          onChange={change}
          required
        />
        <input
          name="discount"
          type="number"
          min="0"
          max="100"
          placeholder="Discount %"
          value={form.discount}
          onChange={change}
        />
        <input value={final.toFixed(2)} readOnly aria-label="Final price" />
        <input
          name="stock"
          type="number"
          min="0"
          placeholder="Stock"
          value={form.stock}
          onChange={change}
        />
        <input
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={change}
        />
        <input
          name="rating"
          type="number"
          min="0"
          max="5"
          step=".1"
          placeholder="Rating"
          value={form.rating}
          onChange={change}
        />
        <label>
          <input
            name="fastDelivery"
            type="checkbox"
            checked={form.fastDelivery}
            onChange={change}
          />{" "}
          Fast Delivery
        </label>
        <label>
          <input
            name="smoothDelivery"
            type="checkbox"
            checked={form.smoothDelivery}
            onChange={change}
          />{" "}
          Smooth Delivery
        </label>
        <label>
          <input
            name="status"
            type="checkbox"
            checked={form.status}
            onChange={change}
          />{" "}
          Active
        </label>
        <button type="submit">
          {editing ? "Update Product" : "Add Product"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing("");
              setForm(emptyProduct);
            }}
          >
            Cancel
          </button>
        )}
      </form>
      <div className="admin-toolbar">
        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table
          headers={[
            "Product",
            "Category",
            "Price",
            "Stock",
            "Status",
            "Created",
            "Actions",
          ]}
          rows={items.map((p) => [
            p.name,
            p.category,
            `Rs. ${p.finalPrice}`,
            p.stock,
            p.status ? "Active" : "Inactive",
            date(p.createdAt),
            <Actions>
              <button onClick={() => edit(p)}>Edit</button>
              <button className="danger" onClick={() => remove(p)}>
                Delete
              </button>
            </Actions>,
          ])}
        />
      )}
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </AdminSection>
  );
}

const trackingStatuses = ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

function BuyingDetails({ notify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    const query = new URLSearchParams({ ...(search && { search }), ...(status && { status }) });
    return request(`/admin/orders?${query}`)
      .then((data) => setItems(data.items || []))
      .catch((error) => notify("error", error.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search, status]);

  const update = async (order, values) => {
    try {
      const data = await request(`/admin/orders/${order._id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      notify("success", data.message);
      setItems((current) => current.map((item) => item._id === order._id ? data.item : item));
    } catch (error) {
      notify("error", error.message);
    }
  };

  return (
    <AdminSection title="Buying Details" subtitle="View student purchases, shipping and contact details, payment information, and delivery tracking.">
      <div className="admin-toolbar">
        <input placeholder="Search order, student, item, phone or address" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All tracking statuses</option>
          {trackingStatuses.map((value) => <option key={value}>{value}</option>)}
        </select>
        <strong>{items.length} orders</strong>
      </div>
      {loading ? <Spinner animation="border" /> : (
        <Table
          headers={["Order / Date", "Purchased Item", "Student Contact", "Shipping Address", "Payment", "Tracking Status", "Details"]}
          rows={items.map((order) => [
            <div><strong>{order.orderNumber}</strong><br /><small>{date(order.createdAt)}</small></div>,
            <div><strong>{order.productName}</strong><br /><span>{order.quantity} × Rs. {order.unitPrice}</span><br /><b>Total: Rs. {order.totalAmount}</b></div>,
            <div><strong>{order.customer?.name}</strong><br /><a href={`tel:${order.customer?.phone}`}>{order.customer?.phone}</a><br /><a href={`mailto:${order.customer?.email}`}>{order.customer?.email}</a></div>,
            order.address,
            <div><span>{order.paymentMode}</span><br /><select value={order.paymentStatus} onChange={(event) => update(order, { paymentStatus: event.target.value })}><option>Pending</option><option>Completed</option></select></div>,
            <select value={order.orderStatus} onChange={(event) => update(order, { orderStatus: event.target.value })}>{trackingStatuses.map((value) => <option key={value}>{value}</option>)}</select>,
            <button onClick={() => setSelected(order)}>View Details</button>,
          ])}
        />
      )}
      {selected && <div className="admin-modal-backdrop" onMouseDown={() => setSelected(null)}><section className="admin-detail-panel admin-detail-modal" onMouseDown={(event) => event.stopPropagation()}><div className="admin-detail-panel__header"><div><span>Order {selected.orderNumber}</span><h2>{selected.productName}</h2></div><button onClick={() => setSelected(null)}>Close</button></div><div className="admin-detail-grid"><div><span>Customer</span><strong>{selected.customer?.name}</strong></div><div><span>Contact</span><strong>{selected.customer?.email}<br/>{selected.customer?.phone}</strong></div><div><span>Shipping address</span><strong>{selected.address}</strong></div><div><span>Quantity and total</span><strong>{selected.quantity} × Rs. {selected.unitPrice}<br/>Rs. {selected.totalAmount}</strong></div><div><span>Payment</span><strong>{selected.paymentMode} · {selected.paymentStatus}</strong></div><div><span>Order status</span><strong>{selected.orderStatus}</strong></div></div><div className="admin-popup-actions">{trackingStatuses.map((value)=><button key={value} onClick={()=>{ update(selected,{orderStatus:value}); setSelected(null); }}>{value}</button>)}</div></section></div>}
    </AdminSection>
  );
}

function AdminSection({ title, subtitle, children }) {
  return (
    <section className="admin-dashboard">
      <Container fluid="xl">
        <div className="admin-section-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </Container>
    </section>
  );
}
function Table({ headers, rows }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="admin-empty-state">No records found.</div>
      )}
    </div>
  );
}
function Actions({ children }) {
  return <div className="admin-row-actions">{children}</div>;
}
export default function App() {
  const [page, setPage] = useState("centers"),
    [notice, setNotice] = useState(null);
  const notify = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 3500);
  };
  return (
    <div className="admin-page">
      <header className="admin-header">
        <Container fluid="xl" className="admin-header__inner">
          <img src={logo} className="admin-brand__logo" />
          <nav className="admin-nav">
            <button onClick={() => setPage("centers")}>
              Education Centers
            </button>
            <button onClick={() => setPage("support")}>Support Tickets</button>
            <button onClick={() => setPage("products")}>
              Ecommerce Products
            </button>
            <button onClick={() => setPage("buying")}>Buying Details</button>
            <button onClick={() => setPage("counselling")}>Student Counselling</button>
          </nav>
        </Container>
      </header>
      {notice && (
        <Container fluid="xl">
          <Alert
            className="mt-3"
            variant={notice.type === "error" ? "danger" : "success"}
          >
            {notice.message}
          </Alert>
        </Container>
      )}
      {page === "centers" && <EducationCenters notify={notify} />}{" "}
      {page === "support" && <SupportTickets notify={notify} />}{" "}
      {page === "products" && <Products notify={notify} />}
      {page === "buying" && <BuyingDetails notify={notify} />}
      {page === "counselling" && <StudentCounselling notify={notify} />}
    </div>
  );
}
