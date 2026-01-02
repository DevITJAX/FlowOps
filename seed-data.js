// Seed script for FlowOps - Run with: node seed-data.js
// Use API_URL=http://localhost:3001/api node seed-data.js for local testing
const API_URL = process.env.API_URL || 'https://flowops-backend.azurewebsites.net/api';

async function seedData() {
    console.log('🌱 Seeding FlowOps database...\n');

    // 1. Register test users
    console.log('1. Creating test users...');
    const users = [
        { name: 'Demo User', email: 'demo@flowops.com', password: 'Demo123!@#', role: 'admin' },
        { name: 'Alice Developer', email: 'alice@flowops.com', password: 'Password123!', role: 'developer' },
        { name: 'Bob Manager', email: 'bob@flowops.com', password: 'Password123!', role: 'manager' },
        { name: 'Charlie QA', email: 'charlie@flowops.com', password: 'Password123!', role: 'qa' }
    ];

    const createdUsers = [];

    for (const user of users) {
        try {
            const registerRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const registerData = await registerRes.json();
            if (registerData.success || registerData.token) {
                console.log(`   ✅ User created: ${user.name}`);
                createdUsers.push({ ...user, _id: registerData.user ? registerData.user.id : null });
            } else {
                console.log(`   ⚠️ User ${user.name}: ${registerData.message || 'might already exist'}`);
            }
        } catch (e) {
            console.log(`   ❌ Failed to create user ${user.name}: ${e.message}`);
        }
    }

    // 2. Login to get token
    console.log('2. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'demo@flowops.com',
            password: 'Demo123!@#'
        })
    });
    const loginData = await loginRes.json();

    if (!loginData.token) {
        console.log('❌ Login failed:', loginData);
        return;
    }
    console.log('   Token received: ✅\n');

    const token = loginData.token;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3. Create sample projects
    console.log('3. Creating sample projects...');

    const projects = [
        {
            name: 'E-Commerce Platform',
            description: 'Développement d\'une plateforme e-commerce complète avec panier, paiement et gestion des commandes.',
            status: 'in_progress'
        },
        {
            name: 'Mobile Banking App',
            description: 'Application mobile de banking avec authentification biométrique et transferts en temps réel.',
            status: 'planned'
        },
        {
            name: 'CRM Dashboard',
            description: 'Tableau de bord CRM pour la gestion des clients, leads et opportunités commerciales.',
            status: 'in_progress'
        }
    ];

    const createdProjects = [];
    for (const project of projects) {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify(project)
        });
        const data = await res.json();
        if (data.data || data._id) {
            createdProjects.push(data.data || data);
            console.log(`   ✅ Created: ${project.name}`);
        } else {
            console.log(`   ⚠️ ${project.name}:`, data.message || 'already exists');
        }
    }

    if (createdProjects.length === 0) {
        console.log('\n   No new projects created. Fetching existing...');
        const existingRes = await fetch(`${API_URL}/projects`, { headers });
        const existingData = await existingRes.json();
        if (existingData.data) {
            createdProjects.push(...existingData.data.slice(0, 3));
        }
    }

    // 3.5 Create Teams
    console.log('\n3.5. Creating teams for first project...');

    if (createdProjects.length > 0) {
        const firstProject = createdProjects[0];
        const projectId = firstProject._id || firstProject.id;

        const teams = [
            { name: 'Frontend Team', description: 'Responsible for all UI/UX development', type: 'development' },
            { name: 'Backend Team', description: 'API and Database management', type: 'development' },
            { name: 'QA Team', description: 'Quality Assurance and Testing', type: 'qa' }
        ];

        for (const team of teams) {
            try {
                // Create team using project-scoped URL
                const res = await fetch(`${API_URL}/projects/${projectId}/teams`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(team)
                });
                const data = await res.json();

                if (data.success && data.data) {
                    console.log(`   ✅ Created Team: ${team.name}`);
                    const teamId = data.data._id;

                    // Add members to team (randomly assign users)
                    // We need to fetch all users first to get their IDs correctly
                    const usersRes = await fetch(`${API_URL}/users`, { headers });
                    const usersData = await usersRes.json();
                    const allUsers = usersData.data || [];

                    if (allUsers.length > 0) {
                        // Assign random users to this team
                        const membersToAdd = allUsers
                            // .filter(u => u.email !== 'demo@flowops.com') // Optional
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 2);

                        for (const member of membersToAdd) {
                            try {
                                await fetch(`${API_URL}/teams/${teamId}/members`, {
                                    method: 'POST',
                                    headers,
                                    body: JSON.stringify({ userId: member._id, role: 'member' })
                                });
                                console.log(`      👤 Added ${member.name} to ${team.name}`);
                            } catch (err) {
                                // Member might already be in team
                            }
                        }
                    }

                } else {
                    console.log(`   ⚠️ Team ${team.name}: ${data.message || 'might already exist'}`);
                }
            } catch (e) {
                console.log(`   ❌ Failed to create team ${team.name}: ${e.message}`);
            }
        }
    } else {
        console.log('   ⚠️ No projects available to assign teams to.');
    }

    // 4. Create sample tasks for each project
    console.log('\n4. Creating sample tasks...');

    const taskTemplates = [
        // To Do
        { title: 'Setup project structure', status: 'todo', priority: 'high', type: 'task', storyPoints: 5 },
        { title: 'Design database schema', status: 'todo', priority: 'highest', type: 'story', storyPoints: 8 },
        { title: 'Create wireframes', status: 'todo', priority: 'medium', type: 'task', storyPoints: 3 },
        { title: 'Write API documentation', status: 'todo', priority: 'low', type: 'task', storyPoints: 2 },

        // Doing (In Progress)
        { title: 'Implement user authentication', status: 'doing', priority: 'highest', type: 'story', storyPoints: 8 },
        { title: 'Build REST API endpoints', status: 'doing', priority: 'high', type: 'task', storyPoints: 5 },
        { title: 'Create React components', status: 'doing', priority: 'medium', type: 'task', storyPoints: 5 },

        // Review
        { title: 'Code review for login feature', status: 'review', priority: 'high', type: 'task', storyPoints: 2 },
        { title: 'Security audit implementation', status: 'review', priority: 'highest', type: 'bug', storyPoints: 3 },

        // Done
        { title: 'Initial project setup', status: 'done', priority: 'high', type: 'task', storyPoints: 3 },
        { title: 'Configure CI/CD pipeline', status: 'done', priority: 'medium', type: 'story', storyPoints: 5 },
        { title: 'Setup Docker containers', status: 'done', priority: 'medium', type: 'task', storyPoints: 3 }
    ];

    for (const project of createdProjects) {
        const projectId = project._id || project.id;
        if (!projectId) continue;

        console.log(`   📁 Adding tasks to: ${project.name} (ID: ${projectId})`);

        for (const task of taskTemplates) {
            try {
                const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        ...task,
                        description: `Task: ${task.title} for project ${project.name}`
                    })
                });
                const data = await res.json();
                if (data.success && data.data) {
                    console.log(`      ✅ ${task.title} (${data.data.taskKey})`);
                } else {
                    console.log(`      ❌ ${task.title}: ${data.message || JSON.stringify(data)}`);
                }
            } catch (e) {
                console.log(`      ❌ Failed: ${task.title} - ${e.message}`);
            }
        }
    }

    // 5. Create sample sprints for first project
    console.log('\n5. Creating sample sprints...');

    if (createdProjects.length > 0) {
        const project = createdProjects[0];
        const projectId = project._id || project.id;

        // Refresh tasks list for this project to ensure we have all tasks (newly created or existing)
        console.log('   🔄 Fetching latest tasks for project...');
        let projectTasks = [];
        try {
            const tasksRes = await fetch(`${API_URL}/projects/${projectId}/tasks`, { headers });
            const tasksData = await tasksRes.json();
            projectTasks = tasksData.data || [];
            console.log(`   ✅ Found ${projectTasks.length} tasks available for sprints`);
        } catch (e) {
            console.log('   ⚠️ Failed to fetch tasks:', e.message);
        }

        const today = new Date();
        const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        const fourWeeksFromNow = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000);

        const sprints = [
            {
                name: 'Sprint 1 - Foundation',
                goal: 'Set up project foundation, authentication, and basic API structure',
                startDate: today.toISOString(),
                endDate: twoWeeksFromNow.toISOString()
            },
            {
                name: 'Sprint 2 - Core Features',
                goal: 'Implement core business features and UI components',
                startDate: twoWeeksFromNow.toISOString(),
                endDate: fourWeeksFromNow.toISOString()
            }
        ];

        const createdSprints = [];
        for (const sprint of sprints) {
            try {
                const res = await fetch(`${API_URL}/projects/${projectId}/sprints`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(sprint)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    createdSprints.push(data.data);
                    console.log(`   ✅ Created: ${sprint.name}`);
                } else {
                    console.log(`   ❌ ${sprint.name}: ${data.message || JSON.stringify(data)}`);
                }
            } catch (e) {
                console.log(`   ❌ Failed: ${sprint.name} - ${e.message}`);
            }
        }

        // Start the first sprint and add tasks to it
        if (createdSprints.length > 0) {
            const firstSprint = createdSprints[0];

            // Add some tasks to the sprint
            const taskIdsForSprint = projectTasks.slice(0, 6).map(t => t._id);
            if (taskIdsForSprint.length > 0) {
                try {
                    await fetch(`${API_URL}/sprints/${firstSprint._id}/tasks`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ taskIds: taskIdsForSprint })
                    });
                    console.log(`   ✅ Added ${taskIdsForSprint.length} tasks to Sprint 1`);
                } catch (e) {
                    console.log(`   ❌ Failed to add tasks to sprint`);
                }
            }

            // Start the sprint
            try {
                await fetch(`${API_URL}/sprints/${firstSprint._id}/start`, {
                    method: 'PUT',
                    headers
                });
                console.log(`   ✅ Started Sprint 1`);
            } catch (e) {
                console.log(`   ❌ Failed to start sprint: ${e.message}`);
            }
        }
    }

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: demo@flowops.com');
    console.log('   Password: Demo123!@#');
    console.log('\n🌐 URL: https://flowops-frontend.azurewebsites.net');
}

seedData().catch(console.error);

