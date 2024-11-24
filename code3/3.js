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
            contacts.push({
                id: Date.now().toString(),
                name,
                phone: phone ? [phone] : [],
                email: email ? [email] : [],
                isTop: false, // 新增字段表示是否置顶
                topOrder: null, // 记录置顶顺序
            });
        }

        renderContacts();
        contactForm.reset();
        document.getElementById("contactId").value = ""; // 重置隐藏字段
    });

    // 渲染联系人列表
    function renderContacts() {
        // 将联系人按置顶顺序排序
        contacts.sort((a, b) => {
            if (a.isTop && b.isTop) {
                return a.topOrder - b.topOrder; // 如果都置顶，按置顶顺序排列
            }
            return b.isTop - a.isTop; // 置顶的联系人排在最前面
        });

        contactTable.innerHTML = "";
        contacts.forEach((contact) => {
            const row = document.createElement("tr");
            const rowClass = contact.isTop ? "highlight" : ""; // 如果置顶，添加加粗样式

            const phoneList = contact.phone
                .map((p, index) => `${p} <button class="delete-phone" data-id="${contact.id}" data-phone-index="${index}">删除</button>`)
                .join("<br>");

            const emailList = contact.email.join("<br>");

            row.innerHTML = `
                <td class="${rowClass}">${contact.name}</td>
                <td class="${rowClass}">${phoneList || "无"}</td>
                <td class="${rowClass}">${emailList || "无"}</td>
                <td>
                    <button class="edit" data-id="${contact.id}">编辑</button>
                    <button class="delete" data-id="${contact.id}">删除</button>
                    <button class="top ${contact.isTop ? 'top-button' : ''}" data-id="${contact.id}">
                        ${contact.isTop ? '取消置顶' : '置顶'}
                    </button>
                </td>
            `;
            contactTable.appendChild(row);
        });
    }

    // 置顶按钮点击事件
    contactTable.addEventListener("click", (e) => {
        if (e.target.classList.contains("top")) {
            const contactId = e.target.dataset.id;
            const contact = contacts.find((c) => c.id === contactId);
            if (contact) {
                if (!contact.isTop) {
                    // 置顶
                    contact.isTop = true;
                    contact.topOrder = Date.now(); // 用时间戳记录置顶顺序
                } else {
                    // 取消置顶
                    contact.isTop = false;
                    contact.topOrder = null; // 取消置顶时清除顺序
                }
                renderContacts(); // 重新渲染
            }
        }

        if (e.target.classList.contains("edit")) {
            const contactId = e.target.dataset.id;
            const contact = contacts.find((c) => c.id === contactId);
            if (contact) {
                document.getElementById("contactId").value = contact.id;
                document.getElementById("name").value = contact.name;
                document.getElementById("phone").value = contact.phone.join(", ");
                document.getElementById("email").value = contact.email.join(", ");
            }
        }

        if (e.target.classList.contains("delete")) {
            const contactId = e.target.dataset.id;
            contacts = contacts.filter((c) => c.id !== contactId);
            renderContacts();
        }

        if (e.target.classList.contains("delete-phone")) {
            const contactId = e.target.dataset.id;
            const phoneIndex = e.target.dataset.phoneIndex;
            const contact = contacts.find((c) => c.id === contactId);
            if (contact) {
                contact.phone.splice(phoneIndex, 1);
                renderContacts();
            }
        }
    });

    // 导出为 Excel
    exportButton.addEventListener("click", () => {
        if (contacts.length === 0) {
            alert("没有可导出的数据！");
            return;
        }

        const data = contacts.map((contact) => ({
            姓名: contact.name,
            电话: contact.phone.join(", "),
            邮箱: contact.email.join(", "),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data, { header: ["姓名", "电话", "邮箱"] });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "通讯录");

        // 触发文件下载
        XLSX.writeFile(workbook, "通讯录.xlsx");
    });

    // 导入联系人（导入文件功能）
    importFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            jsonData.forEach((item) => {
                contacts.push({
                    id: Date.now().toString(),
                    name: item.姓名,
                    phone: item.电话 ? [item.电话] : [],
                    email: item.邮箱 ? [item.邮箱] : [],
                    isTop: false,
                    topOrder: null,
                });
            });

            renderContacts();
        };
        reader.readAsBinaryString(file);
    });

});
