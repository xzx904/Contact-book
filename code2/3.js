document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const contactTable = document.getElementById("contactTable").querySelector("tbody");
    const exportButton = document.getElementById("exportButton");
    const importFile = document.getElementById("importFile");
    let contacts = [];

    // 添加或修改联系人
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("contactId").value; // 隐藏字段
        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();

        if (id) {
            // 编辑联系人
            const contact = contacts.find((c) => c.id === id);
            if (contact) {
                contact.name = name;
                if (phone && !contact.phone.includes(phone)) {
                    contact.phone.push(phone);
                }
                if (email && !contact.email.includes(email)) {
                    contact.email.push(email);
                }
            }
        } else {
            // 添加新联系人
            let existingContact = contacts.find((c) => c.name === name);

            if (existingContact) {
                if (phone && !existingContact.phone.includes(phone)) {
                    existingContact.phone.push(phone);
                }
                if (email && !existingContact.email.includes(email)) {
                    existingContact.email.push(email);
                }
            } else {
                contacts.push({
                    id: Date.now().toString(),
                    name,
                    phone: phone ? [phone] : [],
                    email: email ? [email] : [],
                });
            }
        }

        renderContacts();
        contactForm.reset();
        document.getElementById("contactId").value = ""; // 重置隐藏字段
    });

    // 编辑联系人信息
    contactTable.addEventListener("click", (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains("edit")) {
            const contact = contacts.find((c) => c.id === id);
            if (contact) {
                document.getElementById("contactId").value = contact.id;
                document.getElementById("name").value = contact.name;
                document.getElementById("phone").value = "";
                document.getElementById("email").value = "";
            }
        }

        if (target.classList.contains("delete")) {
            contacts = contacts.filter((c) => c.id !== id);
            renderContacts();
        }

        if (target.classList.contains("delete-phone")) {
            const phoneIndex = target.dataset.phoneIndex;
            const contact = contacts.find((c) => c.id === id);
            if (contact) {
                contact.phone.splice(phoneIndex, 1);
            }
            renderContacts();
        }
    });

    // 导出为 Excel
    exportButton.addEventListener("click", () => {
        const data = contacts.map((contact) => ({
            姓名: contact.name,
            电话: contact.phone.join(", "),
            邮箱: contact.email.join(", "),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "通讯录");
        XLSX.writeFile(wb, "通讯录.xlsx");
    });

    // 导入 Excel
    importFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const importedData = XLSX.utils.sheet_to_json(worksheet);

                if (!Array.isArray(importedData) || importedData.length === 0) {
                    alert("文件内容为空或格式不正确！");
                    return;
                }

                importedData.forEach((row) => {
                    const name = (row["姓名"] || "").toString().trim();
                    const phones = (row["电话"] || "")
                        .toString()
                        .split(",")
                        .map((p) => p.trim());
                    const emails = (row["邮箱"] || "")
                        .toString()
                        .split(",")
                        .map((e) => e.trim());

                    if (!name) return;

                    let existingContact = contacts.find((c) => c.name === name);

                    if (existingContact) {
                        phones.forEach((p) => {
                            if (p && !existingContact.phone.includes(p)) {
                                existingContact.phone.push(p);
                            }
                        });
                        emails.forEach((e) => {
                            if (e && !existingContact.email.includes(e)) {
                                existingContact.email.push(e);
                            }
                        });
                    } else {
                        contacts.push({
                            id: Date.now().toString(),
                            name,
                            phone: phones.filter(Boolean),
                            email: emails.filter(Boolean),
                        });
                    }
                });

                renderContacts();
                alert("导入成功！");
            } catch (err) {
                alert("文件解析失败，请检查文件格式！");
                console.error(err);
            }
        };

        reader.readAsArrayBuffer(file);
    });

    // 渲染联系人列表
    function renderContacts() {
        contactTable.innerHTML = "";
        contacts.forEach((contact) => {
            const row = document.createElement("tr");

            const phoneList = contact.phone
                .map(
                    (p, index) =>
                        `${p} <button class="delete-phone" data-id="${contact.id}" data-phone-index="${index}">删除</button>`
                )
                .join("<br>");

            const emailList = contact.email.join("<br>");

            row.innerHTML = `
                <td>${contact.name}</td>
                <td>${phoneList || "无"}</td>
                <td>${emailList || "无"}</td>
                <td>
                    <button class="edit" data-id="${contact.id}">编辑</button>
                    <button class="delete" data-id="${contact.id}">删除</button>
                </td>
            `;
            contactTable.appendChild(row);
        });
    }
});
