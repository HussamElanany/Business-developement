// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


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
            })
            .catch((error) => {
                console.error('Error saving data: ', error);
            });

        // Clear input fields
        taskInput.value = '';
        deadlineInput.value = '';
    }
}

function renderTasks(snapshot, taskListId) {
    const taskList = document.getElementById(taskListId);
    taskList.innerHTML = ''; // Clear previous data

    snapshot.forEach((doc) => {
        const taskData = doc.data();
        const row = document.createElement('tr');

        // Format the date
        const formattedDate = formatDate(taskData.deadline);

        row.innerHTML = `
            <td>${taskData.task}</td>
            <td>${formattedDate}</td>
            <td>
                ${taskListId === 'taskList' ?
                `<button class="btn btn-danger" onclick="achieveTask('${doc.id}')">Achieved</button>
                     <button class="btn btn-primary" onclick="editTask('${doc.id}', '${taskData.task}', '${taskData.deadline}')">Edit</button>
                     <button class="btn btn-warning" onclick="deleteTask('${doc.id}', '${taskListId}')">Delete</button>`
                : ''}
            </td>
        `;
        taskList.appendChild(row);
    });
}

// Function to delete a task from both active and achieved tasks
window.deleteTask = function deleteTask(taskId, taskListId) {
    const taskRef = doc(firestore, taskListId === 'taskList' ? 'tasks' : 'achievedTasks', taskId);

    // Delete the task from the collection
    deleteDoc(taskRef)
        .then(() => {
            console.log('Task deleted successfully!');
        })
        .catch((error) => {
            console.error('Error deleting task: ', error);
        });

    // Update the UI based on the taskListId
    if (taskListId === 'taskList') {
        showActiveTasks();
    } else if (taskListId === 'achievedTaskList') {
        showAchievedTasks();
    }
};

// Function to move a task to the achieved tasks
window.achieveTask = function achieveTask(taskId) {
    const taskRef = doc(firestore, 'tasks', taskId);
    const achievedTasksRef = collection(firestore, 'achievedTasks');

    // Get the task data before deleting it
    getDoc(taskRef).then((docSnapshot) => {
        const taskData = docSnapshot.data();

        // Delete the task from the 'tasks' collection
        deleteDoc(taskRef)
            .then(() => {
                console.log('Task achieved successfully!');
            })
            .catch((error) => {
                console.error('Error achieving task: ', error);
            });

        // Add the task to the 'achievedTasks' collection
        addDoc(achievedTasksRef, taskData)
            .then(() => {
                console.log('Task moved to achieved tasks!');
            })
            .catch((error) => {
                console.error('Error adding to achieved tasks: ', error);
            });

        // Update the UI
        showActiveTasks();
        showAchievedTasks();
    });
};

function showActiveTasks() {
    onSnapshot(collection(firestore, 'tasks'), (snapshot) => renderTasks(snapshot, 'taskList'));
}

function showAchievedTasks() {
    onSnapshot(collection(firestore, 'achievedTasks'), (snapshot) => renderTasks(snapshot, 'achievedTaskList'));
}

// Initial fetch and update
showActiveTasks();
showAchievedTasks();

document.getElementById('addTaskBtn').addEventListener('click', addTask);

// Function to edit a task
window.editTask = function editTask(taskId, currentTask, currentDeadline) {
    const updatedTask = prompt('Edit task:', currentTask);
    const updatedDeadline = prompt('Edit deadline:', currentDeadline);

    if (updatedTask !== null && updatedTask.trim() !== '') {
        const taskRef = doc(firestore, 'tasks', taskId);

        // Update the task in the 'tasks' collection
        updateDoc(taskRef, {
            task: updatedTask,
            deadline: formatDate(updatedDeadline)
        })
            .then(() => {
                console.log('Task updated successfully!');
            })
            .catch((error) => {
                console.error('Error updating task: ', error);
            });

        // Update the UI
        showActiveTasks();
    }
};