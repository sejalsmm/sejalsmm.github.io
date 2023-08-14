"use strict"
// Sends a new request to update the to-do list
function loadPost() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }
    xhr.open("GET", "/styl/get-global", true)
    xhr.send()
}

function UpdatePost() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }
    

    let sorting_sheme =  document.getElementById("id_sorting_method").innerHTML
    xhr.open("POST", "/styl/get-global", true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&sorting_method=${sorting_sheme}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function loadFollowerPost() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }

    xhr.open("GET", "/styl/get-follower", true)
    xhr.send()
}

function updateFollowerPost() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }

    let sorting_sheme =  document.getElementById("id_sorting_method").innerHTML 
    xhr.open("POST", "/styl/get-follower", true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&sorting_method=${sorting_sheme}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function loadMyPost() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }
    xhr.open("GET", "/styl/get-myvideos", true)
    xhr.send()
}

function updatePage(xhr) {
    if (xhr.status === 200) {
        let response = JSON.parse(xhr.responseText)
        updateList(response)
        return
    }

    if (xhr.status === 0) {
        displayError("Cannot connect to server")
        return
    }


    if (!xhr.getResponseHeader('content-type') === 'application/json') {
        displayError(`Received status = ${xhr.status}`)
        return
    }

    let response = JSON.parse(xhr.responseText)
    if (response.hasOwnProperty('error')) {
        displayError(response.error)
        return
    }

    displayError(response)
}

function displayError(message) {
    let errorElement = document.getElementById("error")
    errorElement.innerHTML = message
}

function updateList(items) {
    // Removes all existing to-do list items
    let post_list = document.getElementById("ajax_posts")
    let posts = items['posts']
    let comments = items['comments']
    // Adds each to do list item received from the server to the displayed list
    posts.forEach(post => insertPost(post,post_list))
    for (let i = 0; i < post_list.children.length; i++){
        let post_id = post_list.children[i].id.replace(/[^0-9]/g, '')
        let comment_list = document.getElementById(`ajax-comments_${post_id}`)
        comments.forEach(comment => insertComment(comment,comment_list, post_id))
    }
}


function insertPost(item, list){
    let item_id = `id_post_div_${item.id}`
    let found = false
    for (let i = 0; i < list.children.length; i++) {
        if (item_id == list.children[i].id){
            let item_like_elem = document.getElementById(`id_post_like_${item.id}`)
            if (item.likes == 1){
                item_like_elem.innerHTML = `${item.likes} like`
            } else {
                item_like_elem.innerHTML = `${item.likes} likes`
            }            
            found = true
        }
    }
    if (!found){
        list.prepend(makeListItemElement(item))
        //let comment_list = document.getElementById(`ajax-comments_${item.id}`)
        //comments.forEach(comment => insertComment(comment,comment_list,item.id))
    }
    return
}

function insertComment(comment,comment_list,post_id){
    if (comment.post_id != post_id){
        return
    }
    let item_id = `id_comment_div_${comment.id}`
    let found = false
    for (let i = 0; i < comment_list.children.length; i++) {
        if (item_id == comment_list.children[i].id){
            found = true
        }
    }
    if (!found){
        comment_list.append(makeCommentElement(comment))
    }
    return 
}

function makeCommentElement(item){
    let profile_link = document.createElement("a");
    profile_link.id = `id_comment_profile_${item.id}`
    if(item.is_logged_in !== item.user_id){
        profile_link.href = `/styl/other/${item.user_id}`
    }    
    else{
        profile_link.href = `/styl/profile`
    }
    profile_link.innerHTML  = `${item.name}`
    profile_link.className = "post_profile"

    let post_text = document.createElement("div");
    post_text.id = `id_comment_text_${item.id}`
    post_text.className = "user_text"
    post_text.innerHTML  = `${sanitize(item.text)}`
    post_text.className = "comment_text"
    
    let post_time = document.createElement("div");
    let date_time = new Date(item.time);
    let date = date_time.toLocaleDateString();
    let time = date_time.toLocaleTimeString([], {hour:'2-digit', minute:"2-digit"})
    post_time.id = `id_comment_date_time_${item.id}`
    post_time.innerHTML  = `${date} ${time}`
    post_time.className = "post_time"
    
    let element = document.createElement("div")
    element.id = `id_comment_div_${item.id}`
    element.className = "comment_div"
    element.appendChild(profile_link)
    element.appendChild(post_text)
    element.appendChild(post_time)
    return element
    
}

// Builds a new HTML "li" element for the to do list
function makeListItemElement(item) {
    let profile_link = makeProfileLinkHTML(item)
    let post_text =  makePostTextHTML(item)
    let post_time = makeDateTimeHTML(item)
    let post_video = makeVideoHTML(item)
    let post_likes = makePostLikesHTML(item)
    let post_like_btn = makePostLikeButtonHTML(item)
    let comment_input_box = makeCommentInputHTML(item)
    let comments = document.createElement("div")
    comments.id = `ajax-comments_${item.id}`
    comments.className = "comment"
    let element = document.createElement("div")
    element.id = `id_post_div_${item.id}`
    element.className = "post_div"

    if (("private" in item) && item.private) {
        let private_tag = makePrivateTagHTML(item)
        element.appendChild(private_tag)
    }
    element.appendChild(post_text)
    element.appendChild(post_video)

    // postinfo requires special styling
    let postinfo = document.createElement("div")
    postinfo.id = `id_post_info_${item.id}`
    postinfo.className = "post_info"
    postinfo.appendChild(post_like_btn)
    postinfo.appendChild(post_likes)
    postinfo.appendChild(profile_link)
    postinfo.appendChild(post_time)
    element.appendChild(postinfo)

    element.appendChild(comment_input_box)
    element.appendChild(comments)
    
    return element
}

function makePrivateTagHTML(item){
    let private_div = document.createElement("div");
    private_div.id = `id_private_tag_${item.id}`;
    private_div.className  = "private_tag";
    private_div.innerHTML = "Private";
    let edit_link = document.createElement("a");
    edit_link.href = `/styl/edit/${item.id}`;
    edit_link.id = `id_edit_link_${item.id}`;
    edit_link.className = "edit-link";
    edit_link.innerHTML = "Edit";
    private_div.append(edit_link);
    return private_div;
}


function makeVideoHTML(item){
    let video_div = document.createElement("div");
    video_div.id = `id_post_video_${item.id}`;
    video_div.className = "post_video";
    video_div.innerHTML = `<video id = "id_post_video_${item.id}" class="video_display" controls >
    <source src="/styl/video/${item.id}" type='video/ogg'>
    <source src="/styl/video/${item.id}" type='video/mp4'>
    </video>`;
    return video_div
}

function makeProfileLinkHTML(item) {
    let profile_link = document.createElement("a");
    profile_link.id = `id_post_profile_${item.id}`
    if(item.is_logged_in !== item.user_id){
        profile_link.href = `/styl/other/${item.user_id}`
    }    
    else{
        profile_link.href = `/styl/profile`
    }
    profile_link.innerHTML  = `${item.name}`
    profile_link.className = "post_profile"
    return profile_link
}
  
function makePostTextHTML(item) {
    let post_text = document.createElement("div");
    post_text.id = `id_post_text_${item.id}`
    post_text.innerHTML  = `${sanitize(item.text)}`
    post_text.className = "post_text"
    return post_text
}

function makePostLikesHTML(item){
    let post_likes = document.createElement("div");
    post_likes.className ="post_likes"
    post_likes.id =`id_post_like_${item.id}`
    if (item.likes == 1){
        post_likes.innerHTML = `${item.likes} like`
    } else {
        post_likes.innerHTML = `${item.likes} likes`
    }  
    return post_likes
}

function makePostLikeButtonHTML(item){
    let post_like_btn = document.createElement("div");
    post_like_btn.className ="post_like_btn"
    post_like_btn.id = `id_post_like_btn_${item.id}`
    
    if (item.is_liked){
        post_like_btn.innerHTML = `<img src="/static/styl/liked.png" class="like_button" onclick="unLike(${item.id})">`
    }else{
        post_like_btn.innerHTML = `<img src="/static/styl/unliked.png" class="unlike_button" onclick="Like(${item.id})">`
    }
    
    return post_like_btn
}

function makeDateTimeHTML(item) {
    let post_time = document.createElement("div");
    let date_time = new Date(item.time);
    let date = date_time.toLocaleDateString();
    let time = date_time.toLocaleTimeString([], {hour:'2-digit', minute:"2-digit"})
    post_time.id = `id_post_date_time_${item.id}`
    post_time.innerHTML  = `${date} ${time}`
    post_time.className = "post_time"
    return post_time
}

function makeCommentInputHTML(item){
    let comment_input_div = document.createElement("div");
    comment_input_div.id = `id_comment_input_div_${item.id}`
    comment_input_div.className = "comment_form"
    let comment_input_text = document.createElement("input");
    comment_input_text.id = `id_comment_input_text_${item.id}`
    comment_input_text.type = "text"
    comment_input_text.name = "text"
    let comment_input_button = document.createElement("span");
    comment_input_button.innerHTML = `<button id = "id_comment_button_${item.id}" onclick="addComment(${item.id})">Submit</button>`
    let comment_input_label = document.createElement("label");
    comment_input_label.for=`id_comment_input_text_${item.id}`
    comment_input_label.innerHTML = "Comment: "

    comment_input_div.appendChild(comment_input_label)
    comment_input_div.appendChild(comment_input_text)
    comment_input_div.appendChild(comment_input_button)
    return comment_input_div
}

function sanitize(s) {
    // Be sure to replace ampersand first
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
}

function addPost() {
    let postTextElement = document.getElementById("id_post_input_text")
    let videoInputElement =  document.getElementById("id_video_upload")
    let postTextValue   = postTextElement.value
    let videoInputValue = videoInputElement.value

    console.log("file inputed is", videoInputValue)
    // Clear input box and old error message (if any)
    postTextElement.value = ''
    displayError('')

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        //updatePage(xhr)
    }

    xhr.open("POST", addPostURL, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`post=${postTextValue}&video=${videoInputValue}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function addComment(post_id) {
    let commentTextElement = document.getElementById(`id_comment_input_text_${post_id}`)
    let commentTextValue   = commentTextElement.value
    
    // Clear input box and old error message (if any)
    commentTextElement.value = ''
    displayError('')

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }

    let sorting_sheme =  document.getElementById("id_sorting_method").innerHTML
    xhr.open("POST", addCommentURL, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&sorting_method=${sorting_sheme}&comment_text=${commentTextValue}&post_id=${post_id}&csrfmiddlewaretoken=${getCSRFToken()}`)
    
}

function Like(post_id) {
    displayError('')

    let like_toggle = document.getElementById(`id_post_like_btn_${post_id}`)
    like_toggle.innerHTML = `<img src="/static/styl/liked.png" class="like_button" onclick="unLike(${post_id})">`
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }
    let curr_location = window.location.href;
    let location = "global"
    if (curr_location.includes("follower")){
        location = "follower"
    }else if (curr_location.includes("myvideos")){
        location = "myvideos"
    }
    let sorting_sheme =  document.getElementById("id_sorting_method").innerHTML
    xhr.open("POST", likeURL, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&location=${location}&sorting_method=${sorting_sheme}&post_id=${post_id}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function unLike(post_id) {
    displayError('')

    let like_toggle = document.getElementById(`id_post_like_btn_${post_id}`)
    like_toggle.innerHTML = `<img src="/static/styl/unliked.png" class="unlike_button" onclick="Like(${post_id})">`
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }
    let curr_location = window.location.href;
    let location = "global"
    if (curr_location.includes("follower")){
        location = "follower"
    }else if (curr_location.includes("myvideos")){
        location = "myvideos"
    }
    let sorting_sheme =  document.getElementById("id_sorting_method").innerHTML
    xhr.open("POST", unLikeURL, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&location=${location}&sorting_method=${sorting_sheme}&post_id=${post_id}&csrfmiddlewaretoken=${getCSRFToken()}`)
}



function getCSRFToken() {
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim()
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length)
        }
    }
    return "unknown"
}

function addLoader() {
    let loader = document.createElement("div");
    loader.className = "loader"
    let box = document.getElementById("background_box")
    box.append(loader)
}


function sort_by_like(){
    //console.log("sup, clikced sort_by_like")
    document.getElementById("id_sorting_method").innerHTML = "likes"
    document.getElementById("id_sort_by_like").innerHTML = "Sort by Most Liked"
    let post_list = document.getElementById("ajax_posts")
    while (post_list.hasChildNodes()) {
        post_list.firstChild.remove()
    }
    
    let request_url = "/styl/get-global"
    let curr_location = window.location.href;
    console.log(curr_location);
    if (curr_location.includes("follower")){
        request_url = "/styl/get-follower"
    }

    
    displayError('')

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }

    
    let sorting_sheme =  document.getElementById("id_sorting_method").innerHTML
    console.log(sorting_sheme);
    console.log(request_url);
    xhr.open("POST", request_url, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&sorting_method=${sorting_sheme}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function sort_by_rC(){
    document.getElementById("id_sorting_method").innerHTML = "Reverse Chronological"
    document.getElementById("id_sort_by_like").innerHTML = "Sort by Most Liked"
    let post_list = document.getElementById("ajax_posts")
    while (post_list.hasChildNodes()) {
        post_list.firstChild.remove()
    }
    
    let request_url = "/styl/get-global"
    let curr_location = window.location.href;
    console.log(curr_location);
    if (curr_location.includes("follower")){
        request_url = "/styl/get-follower"
    }

    
    displayError('')

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }

    
    let sorting_sheme =  "rc"
    console.log(sorting_sheme);
    console.log(request_url);
    xhr.open("POST", request_url, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`&sorting_method=${sorting_sheme}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function openFollowing() {
    document.getElementById("myFollowing").style.display = "block";
  }

function closeFollowing() {
    document.getElementById("myFollowing").style.display = "none";
  }

function openFollowers() {
    document.getElementById("myFollowers").style.display = "block";
  }

function closeFollowers() {
    document.getElementById("myFollowers").style.display = "none";
  }