// عناصر DOM
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const remainingTasksSpan = document.getElementById('remainingTasks');

// البيانات
let tasks = [];
let currentFilter = 'all';

// تحميل البيانات من localStorage عند بدء التطبيق
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
        renderTasks();
        updateStats();
    }
}

// حفظ البيانات في localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// إضافة مهمة جديدة
function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        alert('الرجاء إدخال مهمة');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        date: new Date().toLocaleDateString('ar-SA')
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStats();
    taskInput.value = '';
    taskInput.focus();
}

// حذف مهمة
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// تبديل حالة المهمة (مكتملة/غير مكتملة)
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// حذف جميع المهام المكتملة
function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        alert('لا توجد مهام مكتملة لحذفها');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف ${completedCount} مهمة مكتملة؟`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// عرض المهام بناءً على الفلتر
function renderTasks() {
    let filteredTasks = tasks;

    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state">🎯 لا توجد مهام. أضف مهمة جديدة لتبدأ!</div>';
        return;
    }

    tasksContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${task.date}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">حذف</button>
        </div>
    `).join('');
}

// تحديث الإحصائيات
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;

    totalTasksSpan.textContent = total;
    completedTasksSpan.textContent = completed;
    remainingTasksSpan.textContent = remaining;

    // تحديث حالة زر حذف المهام المكتملة
    clearBtn.disabled = completed === 0;
}

// تغيير الفلتر
function setFilter(filter) {
    currentFilter = filter;
    
    // تحديث الأزرار النشطة
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTasks();
}

// دالة لمنع XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// معالجات الأحداث
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

clearBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// تحميل البيانات عند بدء التطبيق
loadTasks();
