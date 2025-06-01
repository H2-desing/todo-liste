document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById('menu');

    // Gestion du menu
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('visible');
        });
    }

    // Récupérer les tâches depuis le localStorage ou initialiser un tableau vide
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Fonction pour afficher les tâches
    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
        });

        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = getEmptyMessage(filter);
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach((task, index) => {
                const taskItem = createTaskElement(task, index);
                taskList.appendChild(taskItem);
            });
        }
        
        updateTaskCounters();
    }

    // Fonction pour créer un élément de tâche
    function createTaskElement(task, index) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';

        const taskText = document.createElement('span');
        taskText.className = 'task-text' + (task.completed ? ' completed' : '');
        taskText.textContent = task.text;
 
        taskText.addEventListener('dblclick', () => enableTaskEdit(taskText, index));

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(index));
 
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => deleteTask(index));

        taskActions.appendChild(checkbox);
        taskActions.appendChild(deleteBtn);
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskActions);
        
        return taskItem;
    }

    // Fonction pour activer l'édition d'une tâche
    function enableTaskEdit(taskText, index) {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = taskText.textContent;
        editInput.className = 'edit-input';
  
        if (window.innerWidth <= 480) {
            editInput.style.width = '100%';
        } else {
            editInput.style.width = (taskText.offsetWidth + 20) + 'px';
        }

        taskText.replaceWith(editInput);
        editInput.focus();

        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText) {
                tasks[index].text = newText;
                saveTasks();
            }
            renderTasks(getCurrentFilter());
        };
        
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });

        editInput.addEventListener('blur', saveEdit);

        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                renderTasks(getCurrentFilter());
            }
        });
    }

    // Fonction pour adapter l'interface
    function adaptLayout() {
        const isMobile = window.innerWidth <= 768;
        const taskCounters = document.getElementById('taskCounters');
        if (taskCounters) {
            taskCounters.classList.toggle('mobile-view', isMobile);
        }
        renderTasks(getCurrentFilter());
    }

    // Fonction pour mettre à jour les compteurs
    function updateTaskCounters() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const active = total - completed;
        
        const totalEl = document.getElementById('totalTasks');
        const activeEl = document.getElementById('activeTasks');
        const completedEl = document.getElementById('completedTasks');
        
        if (totalEl) totalEl.textContent = `Total: ${total}`;
        if (activeEl) activeEl.textContent = `| En cours: ${active}`;
        if (completedEl) completedEl.textContent = `| Terminées: ${completed}`;
    }
    
    // Fonction pour obtenir le message vide
    function getEmptyMessage(filter) {
        const messages = {
            'all': 'Aucune tâche ajoutée',
            'active': 'Aucune tâche en cours',
            'completed': 'Aucune tâche terminée'
        };
        return messages[filter] || 'Aucune tâche';
    }
    
    // Fonction pour ajouter une tâche
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text, completed: false });
            saveTasks();
            taskInput.value = '';
            renderTasks(getCurrentFilter());
        }
    }

    // Fonction pour basculer l'état d'une tâche
    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks(getCurrentFilter());
    }
    
    // Fonction pour supprimer une tâche
    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks(getCurrentFilter());
    }
    
    // Fonction pour sauvegarder les tâches
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Fonction pour obtenir le filtre actuel
    function getCurrentFilter() {
        const activeBtn = document.querySelector('.filter-btn.active');
        return activeBtn ? activeBtn.dataset.filter : 'all';
    }

    // Écouteurs d'événements
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });

    window.addEventListener('resize', adaptLayout);

    // Initialisation
    renderTasks();
    adaptLayout();
});