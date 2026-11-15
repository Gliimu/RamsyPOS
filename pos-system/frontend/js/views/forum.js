// forum.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';
import { showModal } from '../utils/modal.js';

let messageSubscription = null;
let allTeamMembers = [];
let lastMessageCount = 0;
let unreadCount = 0;

export async function renderForum(container) {
    const user = state.user || { name: 'Guest', role: 'pos_attendant' };
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    
    // Fetch all team members for @mentions
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true });
    allTeamMembers = profiles || [];
    
    // Fetch existing messages
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
    
    if (error) {
        console.error('Error fetching messages:', error);
    }
    
    lastMessageCount = messages?.length || 0;
    
    container.innerHTML = `
        <style>
            .forum-layout {
                display: flex;
                flex-direction: column;
                height: calc(100vh - 120px);
            }
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: var(--bg);
                border-radius: 8px 8px 0 0;
            }
            .message-bubble {
                max-width: 70%;
                padding: 12px 16px;
                border-radius: 12px;
                margin-bottom: 10px;
                word-wrap: break-word;
            }
            .message-mine {
                background: #b8860b;
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            }
            .message-other {
                background: var(--card-bg);
                color: var(--text);
                border: 1px solid var(--border);
                border-bottom-left-radius: 4px;
            }
            .message-sender {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 4px;
                opacity: 0.8;
            }
            .message-time {
                font-size: 10px;
                opacity: 0.6;
                margin-top: 4px;
            }
            .mention-highlight {
                background: #fef3c7;
                color: #92400e;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
            }
            .chat-input-area {
                display: flex;
                gap: 10px;
                padding: 15px;
                background: var(--card-bg);
                border-radius: 0 0 8px 8px;
                border-top: 1px solid var(--border);
            }
            .chat-input {
                flex: 1;
                padding: 12px;
                border: 1px solid var(--border);
                border-radius: 8px;
                font-size: 15px;
                background: var(--bg);
                color: var(--text);
            }
            .send-btn {
                padding: 12px 24px;
                background: #b8860b;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            }
            .send-btn:hover {
                background: #9a7408;
            }
            .mention-dropdown {
                position: absolute;
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-height: 200px;
                overflow-y: auto;
                z-index: 100;
                width: 200px;
                display: none;
            }
            .mention-item {
                padding: 10px 15px;
                cursor: pointer;
                color: var(--text);
                border-bottom: 1px solid var(--border);
            }
            .mention-item:hover {
                background: var(--bg);
            }
            .mention-item:last-child {
                border-bottom: none;
            }
        </style>
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('forum', user.role)}
            </aside>
            <header class="topbar">
                <h2>Staff Forum</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                <div class="forum-layout">
                    <div id="chat-messages" class="chat-messages"></div>
                    <div class="chat-input-area" style="position: relative;">
                        <div id="mention-dropdown" class="mention-dropdown"></div>
                        <input type="text" id="chat-input" class="chat-input" placeholder="Type a message... Use @ to mention someone">
                        <button id="send-btn" class="send-btn">Send</button>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        if (messageSubscription) messageSubscription.unsubscribe();
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });

    // Render existing messages
    renderMessages(messages || [], currentUserId, user.name);
    
    // Scroll to bottom
    scrollToBottom();
    
    // Set up real-time subscription
    setupRealtimeSubscription(currentUserId, user.name);
    
    // Set up message input handlers
    setupMessageInput(currentUserId, user.name);
}

function renderMessages(messages, currentUserId, currentUserName) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 50px;">No messages yet. Start the conversation!</p>';
        return;
    }
    
    container.innerHTML = messages.map(msg => {
        const isMine = msg.sender_id === currentUserId;
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Process @mentions in content
        let displayContent = msg.content;
        const mentionRegex = /@(\w+)/g;
        let match;
        while ((match = mentionRegex.exec(msg.content)) !== null) {
            const mentionName = match[1];
            const replacement = `<span class="mention-highlight">@${mentionName}</span>`;
            displayContent = displayContent.replace(match[0], replacement);
        }
        
        return `
            <div class="message-bubble ${isMine ? 'message-mine' : 'message-other'}">
                ${!isMine ? `<div class="message-sender">${msg.sender_name}</div>` : ''}
                <div>${displayContent}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
    }).join('');
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function setupRealtimeSubscription(currentUserId, currentUserName) {
    // Clean up existing subscription
    if (messageSubscription) {
        messageSubscription.unsubscribe();
    }
    
    // Subscribe to new messages
    messageSubscription = supabase
        .channel('messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                const newMessage = payload.new;
                const isMine = newMessage.sender_id === currentUserId;
                
                // Append new message
                const container = document.getElementById('chat-messages');
                if (container) {
                    const time = new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    let displayContent = newMessage.content;
                    const mentionRegex = /@(\w+)/g;
                    let match;
                    while ((match = mentionRegex.exec(newMessage.content)) !== null) {
                        const mentionName = match[1];
                        const replacement = `<span class="mention-highlight">@${mentionName}</span>`;
                        displayContent = displayContent.replace(match[0], replacement);
                    }
                    
                    const messageHTML = `
                        <div class="message-bubble ${isMine ? 'message-mine' : 'message-other'}">
                            ${!isMine ? `<div class="message-sender">${newMessage.sender_name}</div>` : ''}
                            <div>${displayContent}</div>
                            <div class="message-time">${time}</div>
                        </div>
                    `;
                    
                    container.insertAdjacentHTML('beforeend', messageHTML);
                    scrollToBottom();
                    
                    // Check for @mentions
                    if (!isMine && newMessage.mentions) {
                        const mentions = newMessage.mentions || [];
                        // Check if current user was mentioned (by name)
                        const currentFirstName = currentUserName.split(' ')[0].toLowerCase();
                        const wasMentioned = mentions.some(m => 
                            m.toLowerCase() === currentFirstName || 
                            m.toLowerCase() === currentUserName.toLowerCase()
                        );
                        
                        if (wasMentioned) {
                            showMentionModal(newMessage.sender_name, newMessage.content);
                        }
                    }
                    
                    // Update unread count if not on forum page and message isn't mine
                    if (!isMine && window.location.hash !== '#forum') {
                        unreadCount++;
                        updateNotificationBadge();
                    } else if (!isMine) {
                        // We're on the forum page, don't increment unread
                        // But still check for mentions
                    }
                }
            }
        )
        .subscribe();
}

function setupMessageInput(currentUserId, currentUserName) {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const mentionDropdown = document.getElementById('mention-dropdown');
    
    let currentMentionStart = -1;
    
    // Handle @mentions dropdown
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        // Find @ symbol before cursor
        const beforeCursor = value.substring(0, cursorPos);
        const atSymbolIndex = beforeCursor.lastIndexOf('@');
        
        if (atSymbolIndex !== -1) {
            // Check if there's a space after @ (which would cancel the mention)
            const textAfterAt = value.substring(atSymbolIndex + 1, cursorPos);
            
            if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
                // Show dropdown with matching members
                const searchText = textAfterAt.toLowerCase();
                const matchingMembers = allTeamMembers.filter(m => 
                    m.full_name.toLowerCase().includes(searchText)
                ).slice(0, 5);
                
                if (matchingMembers.length > 0) {
                    currentMentionStart = atSymbolIndex;
                    mentionDropdown.innerHTML = matchingMembers.map(m => `
                        <div class="mention-item" data-name="${m.full_name}" data-id="${m.id}">
                            ${m.full_name}
                        </div>
                    `).join('');
                    mentionDropdown.style.display = 'block';
                    
                    // Handle mention selection
                    document.querySelectorAll('.mention-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const selectedName = item.dataset.name;
                            const firstName = selectedName.split(' ')[0];
                            
                            // Replace @text with @firstName
                            const newValue = value.substring(0, currentMentionStart) + 
                                           '@' + firstName + ' ' + 
                                           value.substring(cursorPos);
                            
                            input.value = newValue;
                            mentionDropdown.style.display = 'none';
                            input.focus();
                            
                            // Place cursor after the mention
                            const newCursorPos = currentMentionStart + firstName.length + 2;
                            input.setSelectionRange(newCursorPos, newCursorPos);
                        });
                    });
                } else {
                    mentionDropdown.style.display = 'none';
                }
            } else {
                mentionDropdown.style.display = 'none';
            }
        } else {
            mentionDropdown.style.display = 'none';
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== input && !mentionDropdown.contains(e.target)) {
            mentionDropdown.style.display = 'none';
        }
    });
    
    // Send message on button click
    sendBtn.addEventListener('click', () => {
        sendMessage(input, currentUserId, currentUserName);
    });
    
    // Send message on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(input, currentUserId, currentUserName);
        }
    });
}

async function sendMessage(input, currentUserId, currentUserName) {
    const content = input.value.trim();
    if (!content) return;
    
    // Extract mentions
    const mentions = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
    }
    
    try {
        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUserId,
                sender_name: currentUserName,
                content: content,
                mentions: mentions
            });
        
        if (error) throw error;
        
        input.value = '';
        document.getElementById('mention-dropdown').style.display = 'none';
    } catch (error) {
        await showModal('Error sending message: ' + error.message);
    }
}

async function showMentionModal(senderName, content) {
    await showModal(
        `<strong>${senderName}</strong> mentioned you:<br><br>"${content}"`,
        'You were mentioned!'
    );
}

function updateNotificationBadge() {
    // Update badge in sidebar
    const forumNav = document.querySelector('.nav-item[onclick*="forum"]');
    if (forumNav) {
        let badge = forumNav.querySelector('.notification-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.style.cssText = `
                background: var(--danger);
                color: white;
                border-radius: 50%;
                padding: 2px 8px;
                font-size: 11px;
                font-weight: bold;
                margin-left: auto;
                min-width: 20px;
                text-align: center;
            `;
            forumNav.appendChild(badge);
        }
        badge.innerText = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Export function to reset unread count when forum is opened
export function resetUnreadCount() {
    unreadCount = 0;
    updateNotificationBadge();
}

// Export function to get unread count
export function getUnreadCount() {
    return unreadCount;
}
