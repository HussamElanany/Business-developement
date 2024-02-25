import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyALg2z9IKboLV34HfuRT58_osCY71UgWak",
    authDomain: "business-growth-platform.firebaseapp.com",
    projectId: "business-growth-platform",
    storageBucket: "business-growth-platform.appspot.com",
    messagingSenderId: "57991878785",
    appId: "1:57991878785:web:f0d47ea8301fee67895580",
    measurementId: "G-EYSXVRRBEE"
};


const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');

    if (taskInput.value.trim() !== '') {
        const taskData = {
            task: taskInput.value,
            deadline: formatDate(deadlineInput.value)
        };

        // Save data to Firestore
        addDoc(collection(firestore, 'tasks'), taskData)
            .then(() => {
                console.log('Data saved successfully!');
                // alert('Data saved successfully!');
            })
            .catch((error) => {
                console.error('Error saving data: ', error);
            });

        // Clear input fields
        taskInput.value = '';
        deadlineInput.value = '';
    }
}

function renderTasks(snapshot) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear previous data

    snapshot.forEach((doc) => {
        const taskData = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${taskData.task}</td>
            <td>${taskData.deadline}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteTask('${doc.id}')">Delete</button>
            </td>
        `;
        taskList.appendChild(row);
    });
}

// Listen for changes in the 'tasks' collection and render the tasks
onSnapshot(collection(firestore, 'tasks'), renderTasks);

// Function to delete a task
window.deleteTask = function deleteTask(taskId) {
    const taskRef = doc(firestore, 'tasks', taskId);
    deleteDoc(taskRef)
        .then(() => {
            console.log('Task deleted successfully!');
            // alert('Task deleted successfully!');
        })
        .catch((error) => {
            console.error('Error deleting task: ', error);
        });
};

document.getElementById('addTaskBtn').addEventListener('click', addTask);
