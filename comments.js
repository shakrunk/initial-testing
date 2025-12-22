(function() {
    'use strict';

    // Helper to escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');

    // Recursive helper to flatten comments for counting
    function countComments(comments) {
        let count = 0;
        comments.forEach(c => {
            count++;
            if (c.replies && c.replies.length > 0) {
                count += countComments(c.replies);
            }
        });
        return count;
    }

    // Load comments from local storage
    function loadComments() {
        if (!commentsList) return;

        const comments = JSON.parse(localStorage.getItem('pageComments')) || [];

        // Update count
        if (commentsCount) {
            const total = countComments(comments);
            commentsCount.textContent = `(${total})`;
        }

        commentsList.innerHTML = '';

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        comments.forEach(comment => {
            renderComment(comment, commentsList);
        });
    }

    // Save a new comment
    // parentId is optional. If provided, adds as a reply.
    function saveComment(name, text, parentId = null) {
        const comments = JSON.parse(localStorage.getItem('pageComments')) || [];

        const newComment = {
            id: Date.now(),
            name: name.trim(),
            text: text.trim(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            replies: []
        };

        if (parentId) {
            // Find parent and add reply
            const addReply = (items) => {
                for (let item of items) {
                    if (item.id === parentId) {
                        item.replies = item.replies || [];
                        item.replies.push(newComment);
                        return true;
                    }
                    if (item.replies && item.replies.length > 0) {
                        if (addReply(item.replies)) return true;
                    }
                }
                return false;
            };
            addReply(comments);
        } else {
            // Top level comment
            comments.unshift(newComment);
        }

        localStorage.setItem('pageComments', JSON.stringify(comments));
        loadComments();
    }

    // Delete a comment
    window.deleteComment = function(id) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        let comments = JSON.parse(localStorage.getItem('pageComments')) || [];

        const removeComment = (items) => {
            return items.filter(item => {
                if (item.id === id) return false;
                if (item.replies) {
                    item.replies = removeComment(item.replies);
                }
                return true;
            });
        };

        comments = removeComment(comments);
        localStorage.setItem('pageComments', JSON.stringify(comments));
        loadComments();
    };

    // Show reply form
    window.showReplyForm = function(button, parentId) {
        // Remove existing reply forms to prevent duplicates
        const existingForms = document.querySelectorAll('.reply-form-container');
        existingForms.forEach(f => f.remove());

        const container = document.createElement('div');
        container.className = 'reply-form-container';

        container.innerHTML = `
            <form class="reply-form" onsubmit="event.preventDefault(); submitReply(this, ${parentId})">
                <div class="comment-form-group">
                    <label>Name</label>
                    <input type="text" class="comment-input reply-name" placeholder="Your name" required>
                </div>
                <div class="comment-form-group">
                    <label>Reply</label>
                    <textarea class="comment-input reply-text" placeholder="Write your reply..." required></textarea>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button type="submit" class="comment-submit-btn">Post Reply</button>
                    <button type="button" class="comment-delete-btn" onclick="this.closest('.reply-form-container').remove()">Cancel</button>
                </div>
            </form>
        `;

        // Append after the comment body but before nested replies
        const card = button.closest('.comment-card');
        const footer = card.querySelector('.comment-footer');
        card.insertBefore(container, footer.nextSibling); // Insert after footer
    };

    // Handle reply submission
    window.submitReply = function(form, parentId) {
        const name = form.querySelector('.reply-name').value;
        const text = form.querySelector('.reply-text').value;

        if (name && text) {
            saveComment(name, text, parentId);
        }
    };

    // Render a single comment (recursive)
    function renderComment(comment, container) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-card';
        commentEl.id = `comment-${comment.id}`;

        commentEl.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.name)}</span>
                <span class="comment-date">${escapeHtml(comment.date)}</span>
            </div>
            <div class="comment-body">${escapeHtml(comment.text)}</div>
            <div class="comment-footer">
                <button class="comment-reply-btn" onclick="showReplyForm(this, ${comment.id})">Reply</button>
                <button class="comment-delete-btn" onclick="deleteComment(${comment.id})">Delete</button>
            </div>
        `;

        // Render replies if any
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'comment-replies';
            comment.replies.forEach(reply => {
                renderComment(reply, repliesContainer);
            });
            commentEl.appendChild(repliesContainer);
        }

        container.appendChild(commentEl);
    }

    // Event Listeners for main form
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('comment-name');
            const textInput = document.getElementById('comment-text');

            if (nameInput.value && textInput.value) {
                saveComment(nameInput.value, textInput.value);
                nameInput.value = '';
                textInput.value = '';
            }
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', loadComments);

})();
