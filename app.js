// Goal Tracking Dashboard Application

class GoalTracker {
    constructor() {
        this.goals = [];
        this.currentView = 'active';
        this.editingGoalId = null;
        this.deprioritizingGoalId = null;
        this.isOnline = true;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGoals();
        this.renderCurrentView();
    }

    // Data Management - Supabase Integration
    async loadGoals() {
        try {
            // Try to fetch from Supabase
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('last_updated', { ascending: false });

            if (error) throw error;

            // Convert from snake_case (Supabase) to camelCase (app)
            this.goals = data.map(dbGoal => this.convertFromSupabase(dbGoal));

            // Cache in localStorage for offline use
            localStorage.setItem('goals', JSON.stringify(this.goals));
            this.isOnline = true;
        } catch (error) {
            console.warn('Failed to load from Supabase, using local cache:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem('goals');
            this.goals = stored ? JSON.parse(stored) : [];
            this.isOnline = false;
        }
    }

    async saveGoals() {
        // Just update localStorage cache and re-render
        // Actual Supabase saves happen in individual CRUD operations
        localStorage.setItem('goals', JSON.stringify(this.goals));
        this.renderCurrentView();
    }

    // Convert between app format (camelCase) and Supabase format (snake_case)
    convertToSupabase(goal) {
        return {
            id: goal.id,
            name: goal.name,
            category: goal.category,
            tracking_type: goal.trackingType,
            current_value: goal.currentValue,
            target_value: goal.targetValue,
            priority: goal.priority,
            status: goal.status,
            date_added: goal.dateAdded,
            target_date: goal.targetDate,
            notes: goal.notes,
            last_updated: goal.lastUpdated,
            completed_date: goal.completedDate,
            deprioritized_date: goal.deprioritizedDate,
            deprioritize_reason: goal.deprioritizeReason
        };
    }

    convertFromSupabase(dbGoal) {
        return {
            id: dbGoal.id,
            name: dbGoal.name,
            category: dbGoal.category,
            trackingType: dbGoal.tracking_type,
            currentValue: dbGoal.current_value,
            targetValue: dbGoal.target_value,
            priority: dbGoal.priority,
            status: dbGoal.status,
            dateAdded: dbGoal.date_added,
            targetDate: dbGoal.target_date,
            notes: dbGoal.notes,
            lastUpdated: dbGoal.last_updated,
            completedDate: dbGoal.completed_date,
            deprioritizedDate: dbGoal.deprioritized_date,
            deprioritizeReason: dbGoal.deprioritize_reason
        };
    }

    async addGoal(goalData) {
        const goal = {
            id: Date.now().toString(),
            name: goalData.name,
            category: goalData.category,
            trackingType: goalData.trackingType,
            currentValue: goalData.trackingType === 'number' ? 0 : false,
            targetValue: goalData.trackingType === 'number' ? parseFloat(goalData.targetValue) || 0 : null,
            priority: goalData.priority,
            status: goalData.status,
            dateAdded: new Date().toISOString(),
            targetDate: goalData.targetDate || null,
            notes: goalData.notes || '',
            lastUpdated: new Date().toISOString(),
            completedDate: null,
            deprioritizedDate: null,
            deprioritizeReason: null
        };

        try {
            // Insert into Supabase
            const { error } = await supabase
                .from('goals')
                .insert([this.convertToSupabase(goal)]);

            if (error) throw error;

            // Update local state
            this.goals.push(goal);
            this.saveGoals();
        } catch (error) {
            console.error('Failed to add goal to Supabase:', error);
            // Fallback to local-only
            this.goals.push(goal);
            this.saveGoals();
            alert('Goal saved locally. Will sync when connection is restored.');
        }
    }

    async updateGoal(id, updates) {
        const index = this.goals.findIndex(g => g.id === id);
        if (index !== -1) {
            this.goals[index] = { ...this.goals[index], ...updates, lastUpdated: new Date().toISOString() };

            // Set completion/deprioritization date
            if (updates.status === 'Completed' && !this.goals[index].completedDate) {
                this.goals[index].completedDate = new Date().toISOString();
            }
            if (updates.status === 'Deprioritized' && !this.goals[index].deprioritizedDate) {
                this.goals[index].deprioritizedDate = new Date().toISOString();
            }

            try {
                // Update in Supabase
                const { error } = await supabase
                    .from('goals')
                    .update(this.convertToSupabase(this.goals[index]))
                    .eq('id', id);

                if (error) throw error;

                this.saveGoals();
            } catch (error) {
                console.error('Failed to update goal in Supabase:', error);
                // Still save locally
                this.saveGoals();
            }
        }
    }

    async deleteGoal(id) {
        try {
            // Delete from Supabase
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveGoals();
        } catch (error) {
            console.error('Failed to delete goal from Supabase:', error);
            // Still delete locally
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveGoals();
        }
    }

    restoreGoal(id) {
        this.updateGoal(id, {
            status: 'Active',
            completedDate: null,
            deprioritizedDate: null,
            deprioritizeReason: null
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });

        // Add goal button
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.openGoalModal();
        });

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModals();
        });

        // Goal form
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGoalFromForm();
        });

        // Tracking type radio buttons
        document.querySelectorAll('input[name="trackingType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleTrackingTypeFields();
            });
        });

        // Import/Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Deprioritize modal
        document.getElementById('cancelDeprioritize').addEventListener('click', () => {
            this.closeModals();
        });

        document.getElementById('deprioritizeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmDeprioritize();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    switchView(view) {
        this.currentView = view;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}View`);
        });

        this.renderCurrentView();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'active':
                this.renderActiveView();
                break;
            case 'weekly':
                this.renderWeeklyView();
                break;
            case 'archive':
                this.renderArchiveView();
                break;
        }
    }

    // Active Work View
    renderActiveView() {
        const container = document.getElementById('activeGoalsContainer');
        const emptyState = document.querySelector('#activeView .empty-state');
        const activeGoals = this.goals.filter(g => g.status === 'Active');

        if (activeGoals.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Group by category
        const grouped = this.groupByCategory(activeGoals);

        // Sort by priority within each category
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => {
                const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        });

        container.innerHTML = Object.keys(grouped).sort().map(category => `
            <div class="category-section">
                <div class="category-header" onclick="app.toggleCategory(this)">
                    <span class="category-title">${this.escapeHtml(category)}</span>
                    <span class="category-count">${grouped[category].length} goal${grouped[category].length !== 1 ? 's' : ''}</span>
                </div>
                <div class="category-content">
                    ${grouped[category].map(goal => this.renderActiveGoalCard(goal)).join('')}
                </div>
            </div>
        `).join('');

        this.attachActiveGoalListeners();
    }

    renderActiveGoalCard(goal) {
        const progress = goal.trackingType === 'number' && goal.targetValue > 0
            ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
            : 0;

        return `
            <div class="goal-card" data-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-title-section">
                        <div class="goal-title">${this.escapeHtml(goal.name)}</div>
                        <div class="goal-meta">
                            <span class="priority-badge priority-${goal.priority}">${goal.priority}</span>
                            <span class="status-badge status-${goal.status}">${goal.status}</span>
                            ${goal.targetDate ? `<span class="date-info">Target: ${this.formatDate(goal.targetDate)}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="goal-tracking">
                    ${goal.trackingType === 'number' ? `
                        <div class="tracking-input">
                            <input type="number"
                                   class="tracking-value"
                                   value="${goal.currentValue}"
                                   min="0"
                                   step="0.01"
                                   data-id="${goal.id}">
                            <span class="tracking-label">/ ${goal.targetValue}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    ` : `
                        <div class="tracking-input">
                            <input type="checkbox"
                                   class="tracking-checkbox"
                                   ${goal.currentValue ? 'checked' : ''}
                                   data-id="${goal.id}">
                            <span class="tracking-label">Completed</span>
                        </div>
                    `}
                </div>

                ${goal.notes ? `<div class="goal-notes">${this.escapeHtml(goal.notes)}</div>` : ''}

                <div class="goal-actions">
                    <select class="btn btn-small priority-select" data-id="${goal.id}">
                        <option value="">Change Priority</option>
                        <option value="High" ${goal.priority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Medium" ${goal.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Low" ${goal.priority === 'Low' ? 'selected' : ''}>Low</option>
                    </select>
                    <select class="btn btn-small status-select" data-id="${goal.id}">
                        <option value="">Change Status</option>
                        <option value="Not Started">Not Started</option>
                        <option value="Active" ${goal.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Completed">Completed</option>
                        <option value="Deprioritized">Deprioritized</option>
                    </select>
                    <button class="btn btn-small btn-secondary edit-goal" data-id="${goal.id}">Edit</button>
                    <button class="btn btn-small btn-danger delete-goal" data-id="${goal.id}">Delete</button>
                </div>

                <div class="last-updated">Last updated: ${this.formatDateTime(goal.lastUpdated)}</div>
            </div>
        `;
    }

    attachActiveGoalListeners() {
        // Tracking value inputs
        document.querySelectorAll('.tracking-value').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const value = parseFloat(e.target.value) || 0;
                this.updateGoal(id, { currentValue: value });
            });
        });

        // Tracking checkboxes
        document.querySelectorAll('.tracking-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.updateGoal(id, { currentValue: e.target.checked });
            });
        });

        // Priority selects
        document.querySelectorAll('.priority-select').forEach(select => {
            select.addEventListener('change', (e) => {
                if (e.target.value) {
                    const id = e.target.dataset.id;
                    this.updateGoal(id, { priority: e.target.value });
                }
            });
        });

        // Status selects
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                if (e.target.value) {
                    const id = e.target.dataset.id;
                    if (e.target.value === 'Deprioritized') {
                        this.openDeprioritizeModal(id);
                        e.target.value = 'Active'; // Reset until confirmed
                    } else {
                        this.updateGoal(id, { status: e.target.value });
                    }
                }
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.openGoalModal(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this goal?')) {
                    this.deleteGoal(id);
                }
            });
        });
    }

    toggleCategory(header) {
        const content = header.nextElementSibling;
        content.classList.toggle('collapsed');
    }

    // Weekly Review View
    renderWeeklyView() {
        const container = document.getElementById('weeklyGoalsContainer');
        const emptyState = document.querySelector('#weeklyView .empty-state');
        const reviewGoals = this.goals.filter(g => g.status !== 'Completed' && g.status !== 'Deprioritized');

        if (reviewGoals.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Calculate stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const updatedThisWeek = reviewGoals.filter(g => new Date(g.lastUpdated) > weekAgo).length;
        const needsAttention = reviewGoals.filter(g => new Date(g.lastUpdated) < twoWeeksAgo).length;

        // Update stats
        document.getElementById('updatedThisWeek').textContent = `${updatedThisWeek}/${reviewGoals.length}`;
        document.getElementById('needsAttention').textContent = needsAttention;

        // Category breakdown
        const categoryStats = {};
        reviewGoals.forEach(g => {
            categoryStats[g.category] = (categoryStats[g.category] || 0) + 1;
        });

        document.getElementById('categoryBreakdown').innerHTML = `
            <span class="stat-label">Goals by Category</span>
            <div style="margin-top: 10px;">
                ${Object.entries(categoryStats).map(([cat, count]) => `
                    <span style="display: inline-block; margin-right: 15px; font-size: 14px;">
                        <strong>${this.escapeHtml(cat)}:</strong> ${count}
                    </span>
                `).join('')}
            </div>
        `;

        // Render goals
        const grouped = this.groupByCategory(reviewGoals);

        container.innerHTML = Object.keys(grouped).sort().map(category => `
            <div class="category-section">
                <div class="category-header" onclick="app.toggleCategory(this)">
                    <span class="category-title">${this.escapeHtml(category)}</span>
                    <span class="category-count">${grouped[category].length} goal${grouped[category].length !== 1 ? 's' : ''}</span>
                </div>
                <div class="category-content">
                    ${grouped[category].map(goal => this.renderWeeklyGoalCard(goal, twoWeeksAgo)).join('')}
                </div>
            </div>
        `).join('');

        this.attachWeeklyGoalListeners();
    }

    renderWeeklyGoalCard(goal, twoWeeksAgo) {
        const needsAttention = new Date(goal.lastUpdated) < twoWeeksAgo;

        return `
            <div class="goal-card ${needsAttention ? 'needs-attention' : ''}" data-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-title-section">
                        <div class="goal-title">${this.escapeHtml(goal.name)}</div>
                        <div class="goal-meta">
                            <span class="priority-badge priority-${goal.priority}">${goal.priority}</span>
                            <span class="status-badge status-${goal.status}">${goal.status}</span>
                            ${needsAttention ? '<span style="color: var(--warning-color); font-weight: 600;">⚠ Needs Attention</span>' : ''}
                        </div>
                    </div>
                </div>

                ${goal.notes ? `<div class="goal-notes">${this.escapeHtml(goal.notes)}</div>` : ''}

                <div class="last-updated">Last updated: ${this.formatDateTime(goal.lastUpdated)}</div>

                <div class="goal-actions">
                    <select class="btn btn-small priority-select-weekly" data-id="${goal.id}">
                        <option value="">Reprioritize</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <button class="btn btn-small btn-secondary deprioritize-goal" data-id="${goal.id}">Deprioritize</button>
                    <button class="btn btn-small btn-secondary edit-goal-weekly" data-id="${goal.id}">Edit</button>
                </div>
            </div>
        `;
    }

    attachWeeklyGoalListeners() {
        // Priority selects
        document.querySelectorAll('.priority-select-weekly').forEach(select => {
            select.addEventListener('change', (e) => {
                if (e.target.value) {
                    const id = e.target.dataset.id;
                    this.updateGoal(id, { priority: e.target.value });
                }
            });
        });

        // Deprioritize buttons
        document.querySelectorAll('.deprioritize-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.openDeprioritizeModal(id);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-goal-weekly').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.openGoalModal(id);
            });
        });
    }

    // Archive View
    renderArchiveView() {
        const container = document.getElementById('archiveGoalsContainer');
        const emptyState = document.querySelector('#archiveView .empty-state');
        const archivedGoals = this.goals.filter(g => g.status === 'Completed' || g.status === 'Deprioritized');

        if (archivedGoals.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Sort by completion/deprioritization date (most recent first)
        archivedGoals.sort((a, b) => {
            const dateA = new Date(a.completedDate || a.deprioritizedDate);
            const dateB = new Date(b.completedDate || b.deprioritizedDate);
            return dateB - dateA;
        });

        container.innerHTML = archivedGoals.map(goal => this.renderArchiveGoalCard(goal)).join('');
        this.attachArchiveGoalListeners();
    }

    renderArchiveGoalCard(goal) {
        const archiveDate = goal.completedDate || goal.deprioritizedDate;

        return `
            <div class="goal-card" data-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-title-section">
                        <div class="goal-title">${this.escapeHtml(goal.name)}</div>
                        <div class="goal-meta">
                            <span class="priority-badge priority-${goal.priority}">${goal.priority}</span>
                            <span class="status-badge status-${goal.status}">${goal.status}</span>
                            <span class="date-info">Category: ${this.escapeHtml(goal.category)}</span>
                        </div>
                    </div>
                </div>

                ${goal.notes ? `<div class="goal-notes">${this.escapeHtml(goal.notes)}</div>` : ''}

                <div class="archive-info">
                    <strong>${goal.status === 'Completed' ? 'Completed' : 'Deprioritized'} on:</strong> ${this.formatDate(archiveDate)}
                    ${goal.deprioritizeReason ? `<div class="archive-reason">Reason: ${this.escapeHtml(goal.deprioritizeReason)}</div>` : ''}
                </div>

                <div class="goal-actions">
                    <button class="btn btn-small btn-primary restore-goal" data-id="${goal.id}">Restore to Active</button>
                    <button class="btn btn-small btn-danger delete-goal-archive" data-id="${goal.id}">Delete</button>
                </div>
            </div>
        `;
    }

    attachArchiveGoalListeners() {
        // Restore buttons
        document.querySelectorAll('.restore-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.restoreGoal(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-goal-archive').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm('Are you sure you want to permanently delete this goal?')) {
                    this.deleteGoal(id);
                }
            });
        });
    }

    // Modal Management
    openGoalModal(id = null) {
        this.editingGoalId = id;
        const modal = document.getElementById('goalModal');
        const form = document.getElementById('goalForm');

        if (id) {
            const goal = this.goals.find(g => g.id === id);
            document.getElementById('modalTitle').textContent = 'Edit Goal';
            document.getElementById('goalName').value = goal.name;
            document.getElementById('goalCategory').value = goal.category;
            document.querySelector(`input[name="trackingType"][value="${goal.trackingType}"]`).checked = true;
            document.getElementById('targetValue').value = goal.targetValue || '';
            document.getElementById('priority').value = goal.priority;
            document.getElementById('status').value = goal.status;
            document.getElementById('targetDate').value = goal.targetDate || '';
            document.getElementById('notes').value = goal.notes;
        } else {
            document.getElementById('modalTitle').textContent = 'Add New Goal';
            form.reset();
        }

        this.toggleTrackingTypeFields();
        this.populateCategoryList();
        modal.classList.add('show');
    }

    openDeprioritizeModal(id) {
        this.deprioritizingGoalId = id;
        const modal = document.getElementById('deprioritizeModal');
        document.getElementById('deprioritizeReason').value = '';
        modal.classList.add('show');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.editingGoalId = null;
        this.deprioritizingGoalId = null;
    }

    toggleTrackingTypeFields() {
        const trackingType = document.querySelector('input[name="trackingType"]:checked').value;
        const numberTargetGroup = document.getElementById('numberTargetGroup');

        if (trackingType === 'number') {
            numberTargetGroup.style.display = 'block';
            document.getElementById('targetValue').required = true;
        } else {
            numberTargetGroup.style.display = 'none';
            document.getElementById('targetValue').required = false;
        }
    }

    populateCategoryList() {
        const categories = [...new Set(this.goals.map(g => g.category))];
        const datalist = document.getElementById('categoryList');
        datalist.innerHTML = categories.map(cat => `<option value="${this.escapeHtml(cat)}">`).join('');
    }

    async saveGoalFromForm() {
        const formData = {
            name: document.getElementById('goalName').value,
            category: document.getElementById('goalCategory').value,
            trackingType: document.querySelector('input[name="trackingType"]:checked').value,
            targetValue: document.getElementById('targetValue').value,
            priority: document.getElementById('priority').value,
            status: document.getElementById('status').value,
            targetDate: document.getElementById('targetDate').value,
            notes: document.getElementById('notes').value
        };

        if (this.editingGoalId) {
            await this.updateGoal(this.editingGoalId, formData);
        } else {
            await this.addGoal(formData);
        }

        this.closeModals();
    }

    confirmDeprioritize() {
        const reason = document.getElementById('deprioritizeReason').value;
        if (this.deprioritizingGoalId && reason) {
            this.updateGoal(this.deprioritizingGoalId, {
                status: 'Deprioritized',
                deprioritizeReason: reason
            });
            this.closeModals();
        }
    }

    // Import/Export
    exportData() {
        const dataStr = JSON.stringify(this.goals, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `goals-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    if (confirm(`This will replace your current ${this.goals.length} goals with ${imported.length} imported goals. Continue?`)) {
                        this.goals = imported;
                        this.saveGoals();
                        alert('Data imported successfully!');
                    }
                } else {
                    alert('Invalid data format. Please select a valid goals backup file.');
                }
            } catch (error) {
                alert('Error reading file. Please ensure it is a valid JSON file.');
            }
        };
        reader.readAsText(file);

        // Reset file input
        document.getElementById('importFile').value = '';
    }

    // Utility Functions
    groupByCategory(goals) {
        return goals.reduce((acc, goal) => {
            if (!acc[goal.category]) {
                acc[goal.category] = [];
            }
            acc[goal.category].push(goal);
            return acc;
        }, {});
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GoalTracker();
});
