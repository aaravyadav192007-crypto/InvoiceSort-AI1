
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const dropZone = document.getElementById("dropZone");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

let documents = [];
let activeFilter = "All";
let nextId = 1;

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "text/csv"
];

function categorizeFile(name) {
  const n = name.toLowerCase();

  if (/electric|water|gas|utility|internet|phone bill/.test(n)) {
    return "Utilities";
  }

  if (/invoice|inv-|billing/.test(n)) {
    return "Invoice";
  }

  if (/receipt|purchase|order|payment/.test(n)) {
    return "Receipt";
  }

  if (/travel|flight|hotel|taxi|uber/.test(n)) {
    return "Travel";
  }

  if (/shop|store|amazon|flipkart|grocery/.test(n)) {
    return "Shopping";
  }

  return "Other";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function addFiles(fileCollection) {
  const files = Array.from(fileCollection);

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      alert(`Unsupported file: ${file.name}`);
      continue;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} is larger than 10 MB.`);
      continue;
    }

    if (documents.some(
      doc => doc.name === file.name &&
             doc.size === file.size
    )) {
      continue;
    }

    documents.unshift({
      id: nextId++,
      name: file.name,
      size: file.size,
      type: file.type,
      category: categorizeFile(file.name),
      date: new Date().toLocaleDateString(),
      file: file
    });
  }

  renderDocuments();
}

fileInput.addEventListener("change", event => {
  addFiles(event.target.files);
  fileInput.value = "";
});

dropZone.addEventListener("dragover", event => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", event => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  addFiles(event.dataTransfer.files);
});

searchInput.addEventListener("input", renderDocuments);

document.getElementById("filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeFilter = button.dataset.filter;

  document.querySelectorAll(".filter").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  renderDocuments();
});

function renderDocuments() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(query);
    const matchesFilter =
      activeFilter === "All" ||
      doc.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  fileList.replaceChildren();

  filtered.forEach(doc => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const icon = document.createElement("span");
    icon.className = "file-icon";
    icon.textContent = doc.type === "application/pdf" ? "📕" :
                       doc.type.startsWith("image/") ? "🖼️" : "📄";

    const name = document.createElement("span");
    name.className = "file-name";
    name.textContent = doc.name;

    nameCell.append(icon, name);

    const categoryCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "category";
    badge.textContent = doc.category;
    categoryCell.appendChild(badge);

    const sizeCell = document.createElement("td");
    sizeCell.textContent = formatSize(doc.size);

    const dateCell = document.createElement("td");
    dateCell.textContent = doc.date;

    const actionCell = document.createElement("td");

    const viewButton = document.createElement("button");
    viewButton.className = "action-btn";
    viewButton.textContent = "View";
    viewButton.addEventListener("click", () => viewFile(doc));

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-btn delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      documents = documents.filter(item => item.id !== doc.id);
      renderDocuments();
    });

    actionCell.append(viewButton, deleteButton);
    row.append(nameCell, categoryCell, sizeCell, dateCell, actionCell);
    fileList.appendChild(row);
  });

  emptyMessage.hidden = filtered.length > 0;
  emptyMessage.textContent = documents.length === 0
    ? "No documents yet. Upload a file to get started!"
    : "No matching documents found.";

  document.getElementById("totalCount").textContent =
    documents.length;

  document.getElementById("invoiceCount").textContent =
    documents.filter(d => d.category === "Invoice").length;

  document.getElementById("receiptCount").textContent =
    documents.filter(d => d.category === "Receipt").length;

  document.getElementById("categoryCount").textContent =
    new Set(documents.map(d => d.category)).size;
}

function viewFile(doc) {
  const url = URL.createObjectURL(doc.file);
  const link = document.createElement("a");

  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

renderDocuments();
