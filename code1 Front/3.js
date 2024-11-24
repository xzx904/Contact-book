document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const contactTableBody = document.querySelector('#contactTable tbody');

    // 用于存储联系人信息
    const contacts = [];

    // 提交表单事件
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('contactId').value;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();

        if (id) {
            // 修改联系人
            const contact = contacts.find(c => c.id === id);
            contact.name = name;
            contact.phone = mergePhones(contact.phone, phone);
            contact.email = email;
        } else {
            // 检查是否已存在相同姓名的联系人
            const existingContact = contacts.find(c => c.name === name);
            if (existingContact) {
                // 合并电话
                existingContact.phone = mergePhones(existingContact.phone, phone);
            } else {
                // 添加新联系人
                const newContact = {
                    id: Date.now().toString(),
                    name,
                    phone,
                    email
                };
                contacts.push(newContact);
            }
        }

        renderContacts();
        contactForm.reset();
    });

    // 合并电话
    function mergePhones(existingPhones, newPhone) {
        const phoneSet = new Set(
            existingPhones.split('/').map(p => p.trim())
        );
        phoneSet.add(newPhone.trim());
        return Array.from(phoneSet).join('/ ');
    }

    // 渲染联系人列表
    function renderContacts() {
        contactTableBody.innerHTML = '';
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.name}</td>
                <td>${contact.phone}</td>
                <td>${contact.email}</td>
                <td>
                    <button class="editBtn">编辑</button>
                    <button class="deleteBtn">删除</button>
                    <button class="topBtn">置顶</button>
                </td>
            `;
            row.dataset.id = contact.id;

            if (contact.isTop) {
                row.classList.add('highlight');
            }

            contactTableBody.appendChild(row);
        });

        // 添加事件监听
        document.querySelectorAll('.editBtn').forEach(button => {
            button.addEventListener('click', handleEdit);
        });

        document.querySelectorAll('.deleteBtn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });

        document.querySelectorAll('.topBtn').forEach(button => {
            button.addEventListener('click', handleTop);
        });
    }

    // 编辑联系人
    function handleEdit(e) {
        const id = e.target.closest('tr').dataset.id;
        const contact = contacts.find(c => c.id === id);

        document.getElementById('contactId').value = contact.id;
        document.getElementById('name').value = contact.name;
        document.getElementById('phone').value = contact.phone.split('/ ')[0]; // 取第一个电话
        document.getElementById('email').value = contact.email;
    }

    // 删除联系人
    function handleDelete(e) {
        const id = e.target.closest('tr').dataset.id;
        const index = contacts.findIndex(c => c.id === id);

        if (index !== -1) {
            contacts.splice(index, 1);
            renderContacts();
        }
    }

    // 置顶联系人
    function handleTop(e) {
        const id = e.target.closest('tr').dataset.id;
        const contact = contacts.find(c => c.id === id);

        // 将置顶联系人移到数组最前面
        contacts.splice(contacts.indexOf(contact), 1);
        contact.isTop = true;
        contacts.unshift(contact);

        // 渲染列表
        renderContacts();
    }
});
