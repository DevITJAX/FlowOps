// Seed script for FlowOps - Run with: node seed-data.js

const API_URL = 'https://flowops-backend.azurewebsites.net/api';

async function seedData() {
    console.log('🌱 Seeding FlowOps database...\n');

    // 1. Register test user
    console.log('1. Creating test user...');
    try {
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Demo User',
                email: 'demo@flowops.com',
                password: 'Demo123!@#'
            })
        });
        const registerData = await registerRes.json();
        console.log('   User created:', registerData.success ? '✅' : registerData.message || '❌');
    } catch (e) {
        console.log('   User might already exist');
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

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: demo@flowops.com');
    console.log('   Password: Demo123!@#');
    console.log('\n🌐 URL: https://flowops-frontend.azurewebsites.net');
}

seedData().catch(console.error);
