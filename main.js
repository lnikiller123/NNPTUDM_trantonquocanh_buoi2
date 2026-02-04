const API_URL = "http://localhost:3000";

// =======================================================
// PHẦN 1: POSTS MANAGEMENT
// =======================================================

async function LoadData() {
    let res = await fetch(`${API_URL}/posts`);
    let posts = await res.json();
    let body = document.getElementById("body_table");
    body.innerHTML = '';
    
    for (const post of posts) {
        const isDeleted = post.isDeleted === true;
        
        // CSS và Text trạng thái
        const rowClass = isDeleted ? 'deleted-row' : '';
        const statusText = isDeleted ? 'Deleted' : 'Active';
        
        // Nút bấm: Restore hoặc Soft Delete
        let actionButton = '';
        if (isDeleted) {
            actionButton = `<input type="button" value="Restore" 
                                   onclick="RestorePost('${post.id}')" 
                                   class="btn-yellow"/>`;
        } else {
            actionButton = `<input type="button" value="Soft Delete" 
                                   onclick="DeletePost('${post.id}')" 
                                   class="btn-red"/>`;
        }

        body.innerHTML += `<tr class="${rowClass}">
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>${statusText}</td>
            <td>${actionButton}</td>
        </tr>`;
    }
}

async function generateNewId(resource) {
    let res = await fetch(`${API_URL}/${resource}`);
    let items = await res.json();
    let maxId = 0;
    items.forEach(item => {
        let currentId = parseInt(item.id);
        if (!isNaN(currentId) && currentId > maxId) maxId = currentId;
    });
    return (maxId + 1).toString();
}

async function SavePost() {
    let id = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    if (id === "") {
        // --- CREATE ---
        try {
            let newId = await generateNewId('posts');
            let res = await fetch(`${API_URL}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: newId,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) console.log("Create Post Success");
        } catch (error) { console.log(error); }

    } else {
        // --- UPDATE ---
        let checkRes = await fetch(`${API_URL}/posts/${id}`);
        if (checkRes.ok) {
            let res = await fetch(`${API_URL}/posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    views: views,
                    isDeleted: false 
                })
            });
            if (res.ok) console.log("Update Post Success");
        } else {
            alert("ID không tồn tại để cập nhật!");
        }
    }
    LoadData();
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("view_txt").value = "";
}

// === CÁC HÀM DELETE/RESTORE ĐÃ BỎ CONFIRM ===

async function DeletePost(id) {
    // Đã xóa dòng if(confirm...) 
    let res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });
    
    if (res.ok) console.log("Soft Delete Success");
    LoadData();
}

async function RestorePost(id) {
    // Đã xóa dòng if(confirm...)
    let res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false })
    });
    
    if (res.ok) console.log("Restore Success");
    LoadData();
}

// =======================================================
// PHẦN 2: COMMENTS MANAGEMENT
// =======================================================

async function LoadComments() {
    let res = await fetch(`${API_URL}/comments`);
    let comments = await res.json();
    let body = document.getElementById("comment_body_table");
    body.innerHTML = '';
    
    for (const cmt of comments) {
        body.innerHTML += `<tr>
            <td>${cmt.id}</td>
            <td>${cmt.text}</td>
            <td>${cmt.postId}</td>
            <td>
                <input type="button" value="Edit" onclick="FillComment('${cmt.id}')">
                <input type="button" value="Delete" class="btn-red" onclick="DeleteComment('${cmt.id}')">
            </td>
        </tr>`;
    }
}

async function FillComment(id) {
    let res = await fetch(`${API_URL}/comments/${id}`);
    if(res.ok){
        let cmt = await res.json();
        document.getElementById("cmt_id_txt").value = cmt.id;
        document.getElementById("cmt_text_txt").value = cmt.text;
        document.getElementById("cmt_postid_txt").value = cmt.postId;
    }
}

async function SaveComment() {
    let id = document.getElementById("cmt_id_txt").value.trim();
    let text = document.getElementById("cmt_text_txt").value;
    let postId = document.getElementById("cmt_postid_txt").value;

    if (id === "") {
        let newId = await generateNewId('comments');
        await fetch(`${API_URL}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newId, text: text, postId: postId })
        });
    } else {
        let check = await fetch(`${API_URL}/comments/${id}`);
        if(check.ok){
            await fetch(`${API_URL}/comments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text, postId: postId })
            });
        } else {
            alert("Comment ID không tồn tại");
        }
    }
    LoadComments();
    document.getElementById("cmt_id_txt").value = "";
    document.getElementById("cmt_text_txt").value = "";
    document.getElementById("cmt_postid_txt").value = "";
}

async function DeleteComment(id) {
    // Đã xóa dòng if(confirm...) -> Cẩn thận vì xóa này là mất luôn
    await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE'
    });
    LoadComments();
}

// =======================================================
// INIT
// =======================================================
LoadData();
LoadComments();