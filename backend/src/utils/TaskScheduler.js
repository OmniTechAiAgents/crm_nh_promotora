const activeTasks = new Map();

const TaskScheduler = {
    schedule(taskId, taskFunction, delayMs) {
        // Se já existe um agendamento para essa tarefa (ex: "vctex_auth"), cancela o antigo
        if (activeTasks.has(taskId)) {
            clearTimeout(activeTasks.get(taskId));
        }



        // consolog interessante gerado pelo querido gemini
        const now = new Date();
        const executionTime = new Date(Date.now() + delayMs);
        const formatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const currentTimeStr = now.toLocaleTimeString('pt-BR', formatOptions);
        const executionTimeStr = executionTime.toLocaleTimeString('pt-BR', formatOptions);
        const minutesUntil = Math.round(delayMs / 60000);
        console.log(`\x1b[36m[TaskScheduler]\x1b[0m 🕒 Agora: \x1b[37m${currentTimeStr}\x1b[0m | Agendada para: \x1b[32m${executionTimeStr}\x1b[0m (\x1b[33m${minutesUntil} min\x1b[0m) | Tarefa: \x1b[35m${taskId}\x1b[0m`);


        
        const timeoutId = setTimeout(async () => {
            activeTasks.delete(taskId);
            await taskFunction();
        }, delayMs);

        activeTasks.set(taskId, timeoutId);
    }
};

export default TaskScheduler;