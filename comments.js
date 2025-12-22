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

    // Load comments from local storage
    function loadComments() {
        if (!commentsList) return;

        const comments = JSON.parse(localStorage.getItem('pageComments')) || [];

        // Update count
        if (commentsCount) {
            commentsCount.textContent = `(${comments.length})`;
        }

        commentsList.innerHTML = '';

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        comments.forEach(comment => {
            renderComment(comment);
        });
    }

    // Save a new comment
    function saveComment(name, text) {
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
            })
        };

        comments.unshift(newComment); // Add to top
        localStorage.setItem('pageComments', JSON.stringify(comments));
        loadComments();
    }

    // Delete a comment (simple implementation for local storage)
    window.deleteComment = function(id) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        const comments = JSON.parse(localStorage.getItem('pageComments')) || [];
        const updatedComments = comments.filter(c => c.id !== id);
        localStorage.setItem('pageComments', JSON.stringify(updatedComments));
        loadComments();
    };

    // Render a single comment
    function renderComment(comment) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-card';
        commentEl.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.name)}</span>
                <span class="comment-date">${escapeHtml(comment.date)}</span>
            </div>
            <div class="comment-body">${escapeHtml(comment.text)}</div>
            <div class="comment-footer">
                <button class="comment-delete-btn" onclick="deleteComment(${comment.id})">Delete</button>
            </div>
        `;
        commentsList.appendChild(commentEl);
    }

    // Event Listeners
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
