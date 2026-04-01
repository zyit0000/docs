export interface DocSection {
  id: string;
  title: string;
  content: string;
  category?: string;
}

const categoryMap: Record<string, string[]> = {
  "Signals": ["cansignalreplicate"],
  "Scripts": ["getcallingscript", "getmodules", "getallthreads", "getcallbackthread", "restorefunction", "script", "getscriptenv", "clonefunction", "disassemblefunction", "getfuncinfo", "getscriptfromthread"],
  "Reflection": ["gethiddenproperty", "sethiddenproperty", "setscriptable", "setthreadidentity"],
  "Metatable": ["makereadonly", "make_readonly", "setupval", "getupval", "getproto", "getconstant"],
  "LuaStateProxy": ["getactorfromstate", "getactorstates", "run_on_actor_thread"],
  "Instances": ["getnilinstances", "get_hidden_gui", "comparefunction", "getcallbackthread", "getcallbackvalue"],
  "Input": ["mouse1click", "mouse1press", "mousemoveabs", "keytap", "keyclickmac"],
  "Filesystem": ["writefile", "fs", "savegame", "saveplace"],
  "Environment": ["gettenv", "getrobloxenv", "getgarbagecollector", "gcstop", "gcstart", "shared"],
  "Encoding": ["base64decode", "base64encode", "base64_encode", "lz4decompress"],
  "Miscellaneous": ["cleartpqueue", "rconsolehide", "clear_teleport_queue", "makeprotoinactive", "queue_on_teleport", "getexecutorname", "rprintconsole", "toclipboard", "spoofscripthwid", "request", "http_request", "isexecutorclosure", "isourclosure", "isrbxactive", "overridemalicious", "invalidate", "isvalidlevel", "getcommunicationchannel", "HttpGet", "setcallbackvalue", "isexploitclosure", "setallprotosinactive", "comparefunction", "issynapsefunction", "debug"]
};

const getCategory = (func: string) => {
  for (const [cat, funcs] of Object.entries(categoryMap)) {
    if (funcs.includes(func)) return cat;
  }
  return "Miscellaneous";
};

const rawFunctions = [
  "cleartpqueue", "fs", "rconsolehide", "clonefunction", "clear_teleport_queue", "cansignalreplicate", "run_on_actor_thread", "debug", "makeprotoinactive", "queue_on_teleport", "getexecutorname", "lz4decompress", "keytap", "gcstop", "rprintconsole", "getcallingscript", "getallthreads", "mouse1press", "keyclickmac", "toclipboard", "getactorfromstate", "spoofscripthwid", "request", "shared", "disassemblefunction", "setscriptable", "getmodules", "http_request", "isexecutorclosure", "savegame", "gcstart", "isourclosure", "getupval", "setthreadidentity", "getproto", "saveplace", "isrbxactive", "make_readonly", "getcallbackthread", "mousemoveabs", "overridemalicious", "base64decode", "mouse1click", "setupval", "gethiddenproperty", "getfuncinfo", "makereadonly", "invalidate", "getnilinstances", "isvalidlevel", "getrobloxenv", "gettenv", "restorefunction", "get_hidden_gui", "getactorstates", "script", "getcommunicationchannel", "setclipboard", "HttpGet", "base64encode", "sethiddenproperty", "writefile", "base64_encode", "getconstant", "setcallbackvalue", "getscriptenv", "getgarbagecollector", "isexploitclosure", "setallprotosinactive", "comparefunction", "issynapsefunction", "getscriptfromthread"
];

// Deduplicate functions and handle potential ID collisions
const seenIds = new Set<string>(["introduction"]);
const uniqueFunctions: string[] = [];

rawFunctions.forEach(f => {
  const id = f.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (!seenIds.has(id)) {
    seenIds.add(id);
    uniqueFunctions.push(f);
  }
});

const specificDocs: Record<string, { description: string; usage: string; parameters?: string; returns?: string; notes?: string }> = {
  "getgenv": {
    description: "Returns the global environment table for the current execution context. This environment is unique to the executor and is shared across all scripts running within the same context. It is the primary location for storing global variables, utility functions, and shared state.",
    usage: "local genv = getgenv()\ngenv.MyGlobal = \"Hello World\"\nprint(MyGlobal) -- Output: Hello World\n\n-- Checking for existing globals\nif getgenv().SomeFeatureEnabled then\n    print(\"Feature is active\")\nend",
    returns: "- **Table**: The global environment table of the executor.",
    notes: "Variables stored in `getgenv()` are persistent across different script executions until the game session ends or the environment is explicitly cleared. It is often used to share data between a UI script and a core logic script."
  },
  "getrenv": {
    description: "Returns the Roblox environment table (the 'Real' environment). This environment contains the standard Roblox globals, libraries (like `task`, `math`, `string`), and the `game` object as seen by standard LocalScripts. Accessing this environment allows you to interact with the game as if you were a normal script, which can be useful for bypassing certain environment-based detections.",
    usage: "local renv = getrenv()\nprint(renv.game.Name) -- Output: Game\n\n-- Accessing standard libraries\nlocal roblox_math = renv.math\nprint(roblox_math.pi)",
    returns: "- **Table**: The standard Roblox environment table.",
    notes: "Modifying the `getrenv()` table is generally discouraged as it can lead to instability or detection by the game's engine. Use it primarily for reading original values or accessing standard Roblox functionality."
  },
  "writefile": {
    description: "Writes a string to a file within the executor's sandbox directory (usually the 'workspace' folder). This function is essential for saving configurations, logging data, or creating persistent storage for your scripts. If the file already exists at the specified path, its contents will be completely overwritten by the new data.",
    usage: "writefile(\"config.json\", '{\"setting\": true}')\n\n-- Writing a simple text file\nwritefile(\"logs/session_1.txt\", \"Session started at \" .. os.date())",
    parameters: "- **Path (string)**: The relative path to the file within the workspace directory. Supports subdirectories (e.g., 'folder/file.txt').\n- **Content (string)**: The string data to be written to the file.",
    returns: "- **void**: This function does not return a value.",
    notes: "The path is relative to the executor's workspace folder. You cannot write files outside of this sandbox for security reasons. Ensure that any parent directories exist before writing, or the function may fail."
  },
  "readfile": {
    description: "Reads the entire content of a file from the executor's sandbox directory and returns it as a string. This is used to load saved configurations, read external data, or retrieve logs created by previous script executions.",
    usage: "local config_raw = readfile(\"config.json\")\nlocal config = game:GetService(\"HttpService\"):JSONDecode(config_raw)\nprint(\"Setting is: \", config.setting)",
    parameters: "- **Path (string)**: The relative path to the file within the workspace directory.",
    returns: "- **String**: The full content of the file as a string.",
    notes: "If the file does not exist, this function will throw an error. It is recommended to use `isfile()` to check for the file's existence before attempting to read it."
  },
  "request": {
    description: "Performs a highly customizable and powerful HTTP request. This is the primary tool for interacting with external web services, REST APIs, and databases. It supports all standard HTTP methods (GET, POST, PUT, DELETE, etc.), custom headers, body data, and cookie management. It is essential for fetching remote scripts, sending analytics, or integrating with external tools like Discord webhooks.",
    usage: "local HttpService = game:GetService(\"HttpService\")\nlocal response = request({\n    Url = \"https://api.opiumware.com/v1/status\",\n    Method = \"GET\",\n    Headers = {\n        [\"Content-Type\"] = \"application/json\",\n        [\"X-Opium-Key\"] = \"your_api_key_here\"\n    }\n})\n\nif response.Success then\n    local data = HttpService:JSONDecode(response.Body)\n    print(\"Server Status: \", data.status)\nelse\n    warn(\"API Request failed with status: \", response.StatusCode)\nend",
    parameters: "- **Options (table)**: A configuration table containing:\n    - `Url` (string): The target URL for the request.\n    - `Method` (string, optional): The HTTP method (default is 'GET').\n    - `Headers` (table, optional): A dictionary of HTTP headers.\n    - `Body` (string, optional): The data to be sent in the request body (for POST/PUT).\n    - `Cookies` (table, optional): A dictionary of cookies to include in the request.",
    returns: "- **Table**: A response object containing:\n    - `Success` (boolean): Whether the request completed without errors.\n    - `StatusCode` (number): The HTTP status code (e.g., 200 for OK, 404 for Not Found).\n    - `StatusMessage` (string): The status message returned by the server.\n    - `Headers` (table): A dictionary of the response headers.\n    - `Body` (string): The raw response body content.",
    notes: "Requests are performed asynchronously and do not block the main Lua thread, although the script will wait for the response before proceeding to the next line. Be mindful of rate limits and security policies when interacting with external domains."
  },
  "getexecutorname": {
    description: "Returns a string identifying the current executor and its version. This is the standard way for scripts to detect if they are running on Opiumware and to adjust their behavior accordingly. It provides both the brand name and the specific build version.",
    usage: "local name, version = getexecutorname()\nprint(\"Current Executor: \", name)\nprint(\"Build Version: \", version)\n\nif name:find(\"Opiumware\") then\n    print(\"Running on Opiumware! Accessing premium features...\")\nend",
    returns: "- **String**: The name of the executor (e.g., 'Opiumware').\n- **String (optional)**: The version of the executor (e.g., 'v1.0.5').",
    notes: "This function is often used by script developers to implement executor-specific optimizations or to display branding within their UIs. The version string is useful for ensuring compatibility with specific executor updates."
  },
  "toclipboard": {
    description: "Copies the provided string directly to the user's system clipboard. This allows your script to interact with the user's operating system, making it easy to share generated keys, Discord invite links, log data, or any other text information that the user might need to paste outside of the Roblox environment.",
    usage: "local inviteLink = \"https://discord.gg/opiumware\"\ntoclipboard(inviteLink)\nprint(\"Discord invite link has been copied to your clipboard!\")",
    parameters: "- **Content (string)**: The text string to be copied to the clipboard.",
    returns: "- **void**: This function does not return a value.",
    notes: "This function interacts directly with the OS clipboard (Windows/Mac). For security reasons, there is no corresponding `fromclipboard()` function to prevent scripts from stealing sensitive data from the user's clipboard."
  },
  "cleartpqueue": {
    description: "Clears all scripts currently queued to execute upon teleporting to a new game instance. This effectively cancels any pending `queue_on_teleport` calls, ensuring that no external code runs when the player arrives at the new Place.",
    usage: "-- Queue a script to run after teleport\nqueue_on_teleport(\"print('Welcome to the new place!')\")\n\n-- Change our mind and clear the queue\ncleartpqueue()\nprint(\"Teleport queue cleared. No script will run after teleport.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "This is a global operation that affects all scripts queued by the current executor instance. It is essential for managing script persistence and preventing unwanted code execution during place transitions."
  },
  "clearqueueonteleport": {
    description: "[A] An alias for `cleartpqueue`. It removes all scripts that were scheduled to run after the next teleport using `queue_on_teleport`. This is a standard function found in most high-end executors for managing teleport persistence.",
    usage: "queue_on_teleport(\"print('Teleported!')\")\n-- ... later in the script logic ...\nclearqueueonteleport()\n-- Nothing will print after teleport now.",
    returns: "- **void**: This function does not return a value.",
    notes: "Provided for compatibility with various script environments and legacy scripts. It functions identically to `cleartpqueue`."
  },
  "clearteleportqueue": {
    description: "[A] An alias for `cleartpqueue`. This function wipes the list of scripts queued to run upon teleportation. It is part of the standard set of teleport management functions in Opiumware.",
    usage: "clearteleportqueue()\nprint(\"All pending teleport scripts have been removed.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "Useful for ensuring a clean state before a teleport if you previously queued scripts that are no longer relevant."
  },
  "clear_teleport_queue": {
    description: "[A] [PS] A ProtoSmasher-compatible alias for `cleartpqueue`. It clears the queue of scripts intended to run after a teleport. This alias ensures that scripts written for other executors can run seamlessly on Opiumware.",
    usage: "clear_teleport_queue()\nprint(\"Teleport queue cleared (ProtoSmasher alias).\")",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [A] (Alias) and [PS] (ProtoSmasher). It is functionally identical to the base `cleartpqueue` function."
  },
  "queue_on_teleport": {
    description: "Schedules a string of Lua code to be executed automatically as soon as the player teleports to a different game instance (Place). This is a critical feature for maintaining script persistence, re-loading UIs, or continuing automation across different places within a multi-place game universe.",
    usage: "local scriptToRun = [[\n    print(\"Successfully teleported to a new place!\")\n    warn(\"Re-loading Opiumware Main Script...\")\n    loadstring(game:HttpGet(\"https://cdn.opiumware.com/main.lua\"))()\n]]\n\nqueue_on_teleport(scriptToRun)\nprint(\"Script successfully queued for teleport.\")",
    parameters: "- **Script (string)**: The Lua source code to be executed after the teleport completes.",
    returns: "- **void**: This function does not return a value.",
    notes: "The queued script runs in a completely fresh Lua environment in the new place. You should typically use this to re-initialize your script's global state or re-load your main execution logic. Multiple scripts can be queued, and they will run in the order they were added."
  },
  "rconsolehide": {
    description: "Hides the executor's internal console window from the user's view. This is useful for cleaning up the screen after a script has finished its initial setup, logging phase, or when the console is no longer needed for debugging.",
    usage: "printconsole(\"Initializing system...\")\nwait(2)\nrconsolehide()\nprint(\"Console hidden to keep the UI clean.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "The console window still exists in the background and its content is preserved. It can be shown again using `rconsoleshow()` if the executor supports it."
  },
  "makeprotoinactive": {
    description: "Marks a specific function prototype as 'inactive'. This effectively disables the function at a low level, preventing it from being called or executed by the game engine or other scripts. This is a powerful technique for permanently disabling specific game features, anti-cheat checks, or logic loops.",
    usage: "local targetFunc = getrenv().someGameFunction\nmakeprotoinactive(targetFunc)\nprint(\"Target game function has been deactivated.\")",
    parameters: "- **Func (function)**: The function prototype to deactivate.",
    returns: "- **void**: This function does not return a value.",
    notes: "This operation is typically irreversible within the current game session. Deactivating a critical engine or game function can lead to instability or crashes. Use with extreme care."
  },
  "clonefunction": {
    description: "Creates a shallow clone of a function. The cloned function will have the same environment, upvalues, and constants as the original, but it will be a distinct function object in memory. This is useful for bypassing certain checks that rely on function identity or for modifying a function's behavior without affecting the original.",
    usage: "local original_print = print\nlocal cloned_print = clonefunction(print)\n\ncloned_print(\"Hello from clone!\")\nprint(original_print == cloned_print) -- Output: false",
    parameters: "- **Func (function)**: The function to clone.",
    returns: "- **Function**: A new function object that is a clone of the original.",
    notes: "The clone is shallow, meaning it shares the same underlying bytecode and environment as the original. If you modify the environment of the clone, it will also affect the original if they share the same environment table."
  },
  "gethiddenproperty": {
    description: "Retrieves the value of a 'hidden' property from a Roblox instance. Hidden properties are those that are not marked as 'Scriptable' in the Roblox API and are therefore normally inaccessible to standard scripts. This function allows you to read internal engine state or properties that are usually restricted.",
    usage: "local lighting = game:GetService(\"Lighting\")\nlocal technology = gethiddenproperty(lighting, \"Technology\")\nprint(\"Lighting Technology: \", technology)",
    parameters: "- **Instance (Instance)**: The Roblox object to inspect.\n- **Property (string)**: The name of the hidden property to retrieve.",
    returns: "- **Variant**: The value of the hidden property. The type depends on the property itself.",
    notes: "Attempting to read a property that does not exist or is truly inaccessible even to the executor may result in an error or a `nil` value. Use this responsibly as it interacts with internal engine behaviors."
  },
  "sethiddenproperty": {
    description: "Sets the value of a hidden property on a Roblox instance. This is the counterpart to `gethiddenproperty` and allows you to modify internal engine states that are normally read-only or completely inaccessible to scripts. This can be used to enable experimental features, bypass certain engine restrictions, or modify rendering behavior.",
    usage: "local lighting = game:GetService(\"Lighting\")\nsethiddenproperty(lighting, \"Technology\", Enum.Technology.Future)\nprint(\"Lighting technology forced to Future.\")",
    parameters: "- **Instance (Instance)**: The Roblox object to modify.\n- **Property (string)**: The name of the hidden property to set.\n- **Value (Variant)**: The new value to assign to the property.",
    returns: "- **void**: This function does not return a value.",
    notes: "Setting hidden properties can be dangerous and may lead to game crashes or unexpected behavior if invalid values are provided. Always ensure the value type matches what the engine expects for that property."
  },
  "getgarbagecollector": {
    description: "Returns a massive table containing every single object currently being tracked by the Lua garbage collector. This includes tables, functions, threads, and userdata. This is an extremely powerful tool for memory analysis, finding hidden objects, or locating specific data structures in memory.",
    usage: "local gc = getgarbagecollector()\nprint(\"Total objects in GC: \", #gc)\n\nfor _, obj in pairs(gc) do\n    if type(obj) == \"table\" and obj.SecretKey then\n        print(\"Found secret key in memory!\")\n    end\nend",
    returns: "- **Table**: A list containing all objects currently in the Lua garbage collector.",
    notes: "Calling this function can be very slow and memory-intensive if the game has a large number of objects. Use it sparingly, especially in performance-critical loops. It is often aliased as `getgc()`."
  },
  "isfile": {
    description: "Checks for the existence of a file at the specified path within the executor's workspace sandbox. This is a non-throwing way to verify if a file is available before attempting to read or modify it.",
    usage: "if isfile(\"settings.json\") then\n    print(\"Loading settings...\")\nelse\n    print(\"Settings not found, using defaults.\")\nend",
    parameters: "- **Path (string)**: The relative path to the file in the workspace.",
    returns: "- **Boolean**: `true` if the file exists, `false` otherwise.",
    notes: "This only checks for files, not folders. Use `isfolder()` for directory checks."
  },
  "isfolder": {
    description: "Checks if a directory (folder) exists at the specified path within the executor's workspace sandbox.",
    usage: "if not isfolder(\"data\") then\n    makefolder(\"data\")\nend",
    parameters: "- **Path (string)**: The relative path to the folder in the workspace.",
    returns: "- **Boolean**: `true` if the folder exists, `false` otherwise.",
    notes: "Useful for ensuring directory structures are in place before performing file operations."
  },
  "listfiles": {
    description: "Returns a table containing the full paths of all files and subfolders located within the specified directory in the workspace sandbox.",
    usage: "local files = listfiles(\"scripts\")\nfor _, path in pairs(files) do\n    if isfile(path) then\n        print(\"File found: \", path)\n    elseif isfolder(path) then\n        print(\"Folder found: \", path)\n    end\nend",
    parameters: "- **Path (string)**: The relative path to the directory to list.",
    returns: "- **Table**: A list of strings representing the paths of all items in the directory.",
    notes: "The returned paths are relative to the workspace root, including the directory name passed as an argument."
  },
  "makefolder": {
    description: "Creates a new directory at the specified path within the workspace sandbox. If the path contains multiple nested folders that do not exist, it will create all of them (recursive creation).",
    usage: "makefolder(\"configs/themes/dark\")\nprint(\"Deep folder structure created.\")",
    parameters: "- **Path (string)**: The relative path of the folder to create.",
    returns: "- **void**: This function does not return a value.",
    notes: "If the folder already exists, this function typically does nothing and does not throw an error."
  },
  "delfile": {
    description: "Permanently deletes a file from the workspace sandbox at the specified path.",
    usage: "if isfile(\"temp_cache.txt\") then\n    delfile(\"temp_cache.txt\")\n    print(\"Cache cleared.\")\nend",
    parameters: "- **Path (string)**: The relative path to the file to delete.",
    returns: "- **void**: This function does not return a value.",
    notes: "This operation is irreversible. Ensure you have the correct path before calling this function."
  },
  "delfolder": {
    description: "Permanently deletes a folder and all of its contents (files and subfolders) from the workspace sandbox. This is a recursive deletion operation.",
    usage: "if isfolder(\"old_logs\") then\n    delfolder(\"old_logs\")\n    print(\"Old logs directory removed.\")\nend",
    parameters: "- **Path (string)**: The relative path to the folder to delete.",
    returns: "- **void**: This function does not return a value.",
    notes: "Extremely dangerous if used with the wrong path. It will delete everything inside the target folder without confirmation."
  },
  "appendfile": {
    description: "Adds the specified string content to the end of an existing file in the workspace. If the file does not exist, it will be created automatically. This is ideal for logging or building up large data files incrementally.",
    usage: "appendfile(\"chat_logs.txt\", \"[User]: Hello World!\\n\")\nappendfile(\"chat_logs.txt\", \"[System]: Welcome!\\n\")",
    parameters: "- **Path (string)**: The relative path to the file.\n- **Content (string)**: The string data to append to the file.",
    returns: "- **void**: This function does not return a value.",
    notes: "Unlike `writefile`, this does not overwrite existing data. It is much more efficient for frequent small updates to a single file."
  },
  "getconnections": {
    description: "Returns a table containing all active connections (RBXScriptConnection objects) for a given signal (RBXScriptSignal). This allows you to inspect, disable, or disconnect existing event handlers, including those created by the game's own scripts.",
    usage: "local connections = getconnections(game:GetService(\"Players\").LocalPlayer.Idled)\nfor _, connection in pairs(connections) do\n    connection:Disable() -- Prevent the AFK kick\n    print(\"Disabled an idle connection.\")\nend",
    parameters: "- **Signal (RBXScriptSignal)**: The event signal to inspect (e.g., `Part.Touched`).",
    returns: "- **Table**: A list of connection objects. Each object typically has methods like `:Disable()`, `:Enable()`, `:Disconnect()`, and properties like `.Function`.",
    notes: "Disabling connections is a common technique for bypassing anti-cheats or modifying game behavior without completely removing the handlers."
  },
  "firesignal": {
    description: "Manually triggers a Roblox signal, executing all connected handlers with the provided arguments. This allows you to simulate game events, such as clicking a button, touching a part, or receiving a remote event, even if the actual event hasn't occurred.",
    usage: "local button = game:GetService(\"Players\").LocalPlayer.PlayerGui.Main.SubmitButton\nfiresignal(button.MouseButton1Click)\nprint(\"Simulated a button click.\")",
    parameters: "- **Signal (RBXScriptSignal)**: The signal to fire.\n- **Args (Variant, optional)**: The arguments to pass to the connected functions.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is a powerful way to interact with UI elements or game logic that is tied to specific events."
  },
  "getcallingscript": {
    description: "Returns the script instance that is currently responsible for the execution of the code. In an exploit context, this often returns the script that was 'active' when the exploit function was called, or the script object associated with the current thread.",
    usage: "local caller = getcallingscript()\nif caller then\n    print(\"Code triggered by: \", caller:GetFullName())\nelse\n    print(\"No calling script detected (likely a core thread).\")\nend",
    returns: "- **Instance (Script/LocalScript/ModuleScript)**: The instance of the calling script, or `nil` if no script is associated.",
    notes: "Often used in hooks to determine which game script is calling a specific function. Aliased as `get_calling_script()`."
  },
  "getmodules": {
    description: "Returns a table containing all ModuleScript instances currently existing in the game's memory, regardless of their location in the DataModel. This includes modules that might be hidden or parented to `nil`.",
    usage: "local all_modules = getmodules()\nfor _, module in pairs(all_modules) do\n    if module.Name == \"NetworkConfig\" then\n        print(\"Found network module at: \", module:GetFullName())\n    end\nend",
    returns: "- **Table**: A list of all ModuleScript instances.",
    notes: "This is a comprehensive search and can be used to find modules that are otherwise hard to locate. Aliased as `get_loaded_modules()`."
  },
  "getallthreads": {
    description: "Returns a table of all active Lua threads (coroutines) currently managed by the Lua state. This allows you to inspect the execution state of the entire game and executor.",
    usage: "local threads = getallthreads()\nprint(\"Total active threads: \", #threads)\n\nfor _, thread in pairs(threads) do\n    print(\"Thread status: \", coroutine.status(thread))\nend",
    returns: "- **Table**: A list of all active thread objects.",
    notes: "Useful for advanced debugging or identifying scripts that are running in the background."
  },
  "isexecutorclosure": {
    description: "Returns `true` if the provided function (closure) was created by the executor's environment. This is a vital security and debugging tool used to distinguish between original game functions and those that have been defined or modified by your own scripts or the executor's internal libraries. It works by checking the function's internal metadata and execution context.",
    usage: "local function myFunc() end\n\nprint(isexecutorclosure(myFunc)) -- Output: true\nprint(isexecutorclosure(print)) -- Output: false (unless print was hooked)",
    parameters: "- **Func (function)**: The function object to check.",
    returns: "- **Boolean**: `true` if the function is an executor closure, `false` otherwise.",
    notes: "This function is essential for security checks in hooks to ensure that you are not accidentally interfering with the executor's own internal logic. It is aliased as `isourclosure()`, `isexploitclosure()`, and `issynapsefunct()`."
  },
  "isrbxactive": {
    description: "Returns `true` if the Roblox game window is currently the focused (foreground) window on the user's operating system. This is a crucial check for scripts that perform automated inputs (like mouse clicks or key presses) to ensure they only act when the user is actually playing the game, preventing 'ghost inputs' in other applications.",
    usage: "while task.wait(0.5) do\n    if isrbxactive() then\n        -- Perform automated task safely\n    else\n        -- Pause task to avoid interfering with other apps\n    end\nend",
    returns: "- **Boolean**: `true` if the Roblox window is active, `false` otherwise.",
    notes: "This function uses OS-level APIs to determine window focus. It is highly recommended to use this before any `mouse1click`, `keytap`, or similar input simulation functions."
  },
  "mouse1click": {
    description: "Simulates a complete left mouse button click (a rapid press and release sequence) at the current virtual cursor position. This is a virtual input event injected directly into the game's input processing pipeline and does not physically move or affect the user's actual mouse hardware.",
    usage: "mousemoveabs(500, 500)\ntask.wait(0.1)\nmouse1click()\nprint(\"Virtual left click performed at (500, 500).\")",
    returns: "- **void**: This function does not return a value.",
    notes: "For more complex interactions, consider using `mouse1press()` and `mouse1release()` separately. This function is ideal for clicking buttons or interacting with simple UI elements."
  },
  "mouse1press": {
    description: "Simulates pressing and holding down the left mouse button at the current virtual cursor position. The button will remain 'pressed' until a corresponding `mouse1release()` call is made or the script terminates.",
    usage: "mouse1press()\ntask.wait(2)\nmouse1release()\nprint(\"Left mouse button was held for 2 seconds.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "Essential for simulating drag-and-drop operations, drawing in-game, or holding down a continuous fire button in combat games."
  },
  "mousemoveabs": {
    description: "Instantly teleports the virtual mouse cursor to the specified absolute pixel coordinates on the user's primary monitor. The coordinate (0, 0) represents the top-left corner of the screen. This function is the foundation for all automated mouse interactions.",
    usage: "local screenWidth, screenHeight = 1920, 1080\nmousemoveabs(screenWidth / 2, screenHeight / 2)\nprint(\"Virtual cursor moved to the center of the screen.\")",
    parameters: "- **X (number)**: The absolute X coordinate in pixels.\n- **Y (number)**: The absolute Y coordinate in pixels.",
    returns: "- **void**: This function does not return a value.",
    notes: "The coordinates are relative to the entire screen resolution, not just the Roblox game window. You may need to calculate the window's position and size to accurately target in-game elements."
  },
  "keytap": {
    description: "Simulates a quick 'tap' (press and release) of a specific keyboard key. This function sends a virtual key event directly to the Roblox engine, making it appear as if the user physically pressed the key.",
    usage: "keytap(Enum.KeyCode.E)\nprint(\"Simulated pressing the 'E' interaction key.\")",
    parameters: "- **KeyCode (Enum.KeyCode)**: The Roblox KeyCode representing the key to be tapped.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is the most common function for automating keyboard interactions like opening menus, jumping, or triggering abilities."
  },
  "base64encode": {
    description: "Encodes a raw binary or text string into a Base64-encoded ASCII string. This is a standard method for representing binary data in a text format, often used for data obfuscation, transmitting data over text-based protocols (like HTTP), or preparing data for storage in formats that don't support raw binary.",
    usage: "local secretData = \"Opiumware Premium Access\"\nlocal encoded = base64encode(secretData)\nprint(\"Encoded Data: \", encoded) -- Output: T3BpdW13YXJlIFByZW1pdW0gQWNjZXNz",
    parameters: "- **Data (string)**: The raw string data to be encoded.",
    returns: "- **String**: The resulting Base64 encoded string.",
    notes: "Base64 encoding increases the data size by approximately 33%. This function is aliased as `base64_encode()`."
  },
  "base64decode": {
    description: "Decodes a Base64-encoded string back into its original raw binary or text format. This is the inverse operation of `base64encode`.",
    usage: "local encoded = \"T3BpdW13YXJlIFByZW1pdW0gQWNjZXNz\"\nlocal decoded = base64decode(encoded)\nprint(\"Decoded Data: \", decoded)",
    parameters: "- **Data (string)**: The Base64 encoded string to decode.",
    returns: "- **String**: The original raw string data.",
    notes: "If the input string is not a valid Base64 format, the function may throw an error or return corrupted data. Always ensure your input is properly encoded."
  },
  "lz4decompress": {
    description: "Decompresses a string that was compressed using the high-performance LZ4 algorithm. Roblox utilizes LZ4 extensively for internal data structures, network packets, and place files. This function is essential for scripts that need to inspect or modify these compressed engine components.",
    usage: "local compressed = \"...\" -- Some LZ4 compressed data\nlocal originalSize = 1024 -- The known uncompressed size\nlocal decompressed = lz4decompress(compressed, originalSize)\nprint(\"Successfully decompressed \", #decompressed, \" bytes.\")",
    parameters: "- **Data (string)**: The LZ4-compressed string data.\n- **Size (number)**: The exact size of the data *before* it was compressed. This is a requirement of the LZ4 decompression algorithm.",
    returns: "- **String**: The original uncompressed string data.",
    notes: "Providing an incorrect `Size` value will result in a decompression failure or corrupted output. You must know the original size beforehand."
  },
  "getupval": {
    description: "Retrieves the current value of an upvalue (a variable captured from an outer scope) from a Lua function at a specific index. This is a powerful reflection tool that allows you to 'peek' into the internal state and private variables of any function.",
    usage: "local function createCounter()\n    local count = 0\n    return function() count = count + 1; return count end\nend\n\nlocal myCounter = createCounter()\nlocal currentCount = getupval(myCounter, 1)\nprint(\"The internal count is currently: \", currentCount)",
    parameters: "- **Func (function)**: The function object to inspect.\n- **Index (number)**: The 1-based index of the upvalue to retrieve.",
    returns: "- **Variant**: The value stored in the upvalue at the specified index.",
    notes: "Upvalues are indexed in the order they appear in the function's source code. You can use `getfuncinfo()` to determine the total number of upvalues a function has. Aliased as `getupvalue()`."
  },
  "setupval": {
    description: "Modifies the value of an upvalue within a Lua function. This allows you to directly alter the internal state and private variables of a function, effectively changing its behavior without re-defining it. This is a core technique for 'hot-patching' game logic or bypassing anti-cheat checks.",
    usage: "local function checkAuth()\n    local isAuthed = false\n    if isAuthed then print(\"Access Granted\") else print(\"Access Denied\") end\nend\n\nsetupval(checkAuth, 1, true)\ncheckAuth() -- Output: Access Granted",
    parameters: "- **Func (function)**: The function object to modify.\n- **Index (number)**: The 1-based index of the upvalue to set.\n- **Value (Variant)**: The new value to assign to the upvalue.",
    returns: "- **void**: This function does not return a value.",
    notes: "Use this with extreme caution, as modifying internal state can lead to unexpected side effects or crashes if the function expects a specific data type or value range. Aliased as `setupvalue()`."
  },
  "getproto": {
    description: "Retrieves an inner function (prototype) defined within another function at a specific index. This allows you to access and manipulate nested functions that are not directly exposed or returned by the parent function.",
    usage: "local function parent()\n    local function hiddenChild() print(\"I am hidden!\") end\n    return \"Parent finished\"\nend\n\nlocal childProto = getproto(parent, 1)\nchildProto() -- Output: I am hidden!",
    parameters: "- **Func (function)**: The parent function containing the nested prototype.\n- **Index (number)**: The 1-based index of the prototype to retrieve.",
    returns: "- **Function**: The nested function object (prototype).",
    notes: "This is a deep reflection tool used for analyzing complex script structures and finding hidden logic within large game scripts."
  },
  "getconstant": {
    description: "Retrieves a constant value (such as a string, number, or boolean literal) from a function's internal constant table at a specific index. This allows you to see exactly what hardcoded values a function uses in its logic.",
    usage: "local function greet() print(\"Hello, Opiumware User!\") end\nlocal message = getconstant(greet, 2) -- Index 1 might be 'print'\nprint(\"Function uses the constant string: \", message)",
    parameters: "- **Func (function)**: The function object to inspect.\n- **Index (number)**: The 1-based index of the constant to retrieve.",
    returns: "- **Variant**: The constant value found at the specified index.",
    notes: "The constant table contains all literals used by the function. The exact indexing depends on how the Luau compiler organized the function's bytecode. Aliased as `debug.getconstant()`."
  },
  "getfuncinfo": {
    description: "Returns a comprehensive table containing detailed debug and metadata information about a Lua function. This includes its name, source location, line numbers, parameter count, and upvalue count. It is the definitive tool for function introspection.",
    usage: "local info = getfuncinfo(print)\nprint(\"Function Name: \", info.name)\nprint(\"Defined on line: \", info.linedefined)\nprint(\"Number of Upvalues: \", info.nups)",
    parameters: "- **Func (function)**: The function object to inspect.",
    returns: "- **Table**: A metadata table containing fields such as:\n    - `name` (string): The function's name (if available).\n    - `source` (string): The source string or file path where the function was defined.\n    - `short_src` (string): A shortened version of the source.\n    - `linedefined` (number): The line number where the function starts.\n    - `lastlinedefined` (number): The line number where the function ends.\n    - `what` (string): The type of function ('Lua', 'C', or 'main').\n    - `numparams` (number): The number of fixed parameters the function accepts.\n    - `is_vararg` (number): 1 if the function is variadic (uses `...`), 0 otherwise.\n    - `nups` (number): The total number of upvalues the function captures.",
    notes: "This is a more powerful version of the standard Lua `debug.getinfo` function, tailored for the Opiumware environment. Aliased as `getinfo()`."
  },
  "setscriptable": {
    description: "Dynamically toggles the 'Scriptable' attribute of a specific property on a Roblox instance. When a property is marked as scriptable, it becomes accessible via standard Lua `.` and `=` syntax, even if it is normally hidden or restricted by the Roblox engine.",
    usage: "local part = Instance.new(\"Part\")\nsetscriptable(part, \"Size\", true)\nprint(\"The 'Size' property is now fully scriptable via Lua.\")",
    parameters: "- **Instance (Instance)**: The Roblox object to modify.\n- **Property (string)**: The exact name of the property.\n- **Scriptable (boolean)**: `true` to make the property scriptable, `false` to hide it.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is an advanced reflection feature that can expose powerful engine capabilities that are usually reserved for internal Roblox use."
  },
  "rprintconsole": {
    description: "Prints a message to the executor's internal console window. Unlike the standard `print`, this output is only visible within the executor's UI and is not sent to the Roblox developer console. This is ideal for debugging scripts without cluttering the game's logs.",
    usage: "rprintconsole(\"Critical Error: \", 255, 0, 0)\nrprintconsole(\"System initialized.\", 0, 255, 0)",
    parameters: "- **Message (string)**: The text to display in the console.\n- **R (number, optional)**: The red component of the text color (0-255).\n- **G (number, optional)**: The green component of the text color (0-255).\n- **B (number, optional)**: The blue component of the text color (0-255).",
    returns: "- **void**: This function does not return a value.",
    notes: "If no color is provided, the text defaults to white. This is often aliased as `printconsole()`."
  },
  "HttpGet": {
    description: "A legacy function used to perform a synchronous HTTP GET request. It fetches the content of the specified URL and returns it as a raw string. This function is primarily maintained for compatibility with older scripts and those designed for executors that only support synchronous networking. It is essentially a wrapper around the game's internal `HttpGet` method, but with elevated permissions.",
    usage: "local rawScript = HttpGet(\"https://raw.githubusercontent.com/User/Repo/main/script.lua\")\nloadstring(rawScript)()\nprint(\"Remote script successfully fetched and executed.\")",
    parameters: "- **Url (string)**: The full, absolute URL to fetch data from (e.g., 'https://example.com/data.txt').",
    returns: "- **String**: The raw response body content returned by the server.",
    notes: "It is highly recommended to use the more modern, asynchronous, and flexible `request()` function instead. `HttpGet` will block the current Lua thread until the request completes, which can lead to script 'freezing' if the server is slow. This function is often aliased as `game:HttpGet()`."
  },
  "setclipboard": {
    description: "[A] An alias for the `toclipboard` function. It copies the provided string content directly to the user's system clipboard, making it available for pasting into other applications outside of the Roblox environment. This is a common naming convention in many script communities.",
    usage: "local discordLink = \"https://discord.gg/opiumware\"\nsetclipboard(discordLink)\nprint(\"Opiumware Discord link has been copied to your clipboard!\")",
    parameters: "- **Content (string)**: The text string to be copied to the clipboard.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [A] (Alias). It functions identically to `toclipboard()`. This is a one-way operation for security reasons; scripts cannot read the user's clipboard."
  },
  "fs": {
    description: "The `fs` (Filesystem) library table. This table serves as a structured container for all functions related to interacting with the executor's isolated workspace sandbox. It provides a clean, organized way to access file operations like reading, writing, appending, and deleting files, as well as managing directories.",
    usage: "fs.writefile(\"config.json\", \"{ 'theme': 'dark' }\")\nlocal content = fs.readfile(\"config.json\")\nprint(\"Loaded configuration: \", content)",
    returns: "- **Table**: The library table containing all filesystem-related functions (e.g., `fs.readfile`, `fs.writefile`, `fs.isfile`, etc.).",
    notes: "Using the `fs` table is often preferred for better code organization, although the individual functions are also available globally for convenience. All operations are restricted to the executor's 'workspace' folder for security."
  },
  "debug": {
    description: "The `debug` library table. This is a powerful suite of functions used for low-level inspection and manipulation of the Lua state. It provides tools for accessing function metadata, modifying upvalues, inspecting constants, and analyzing the call stack. It is the primary tool for reverse engineering and advanced script development.",
    usage: "local function myFunc() local x = 10 end\ndebug.setupvalue(myFunc, 1, 20)\nlocal info = debug.getinfo(myFunc)\nprint(\"Function source: \", info.source)",
    returns: "- **Table**: The library table containing all debug-related functions (e.g., `debug.getupvalue`, `debug.setupvalue`, `debug.getinfo`, etc.).",
    notes: "Many of these functions are also available globally (e.g., `getupval`, `setupval`). The `debug` table follows the standard Lua debug library structure but is enhanced with Opiumware-specific capabilities."
  },
  "gcstop": {
    description: "Manually halts the Lua garbage collector (GC). This prevents the Lua VM from automatically scanning for and freeing unused memory until `gcstart()` is called. This is a highly advanced technique used to prevent performance hitches or 'stuttering' during extremely time-sensitive operations, such as high-frequency hooks or complex calculations.",
    usage: "gcstop()\n-- Perform a massive calculation that creates many temporary objects\n-- ...\ngcstart()\nprint(\"Garbage collection resumed after intensive task.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "Leaving the garbage collector stopped for an extended period will cause memory usage to grow indefinitely, eventually leading to a 'Memory Exhaustion' crash. Always ensure that every `gcstop()` is eventually followed by a `gcstart()`."
  },
  "gcstart": {
    description: "Restarts the Lua garbage collector after it has been manually stopped using `gcstop()`. This resumes the automatic memory management process, allowing the Lua VM to reclaim memory from objects that are no longer in use.",
    usage: "gcstart()\nprint(\"Automatic garbage collection is now active.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "It is generally recommended to keep the garbage collector running at all times unless you have a very specific and well-tested reason to stop it for a short duration."
  },
  "shared": {
    description: "A global, persistent table that is shared across all scripts executed by the Opiumware instance. This provides a simple and efficient way for different scripts (e.g., a main script and its modules, or two unrelated scripts) to communicate, share data, and synchronize state without needing external files or complex networking.",
    usage: "-- In Script A (Initialization)\nshared.OpiumwareConfig = { Version = \"1.0\", DebugMode = true }\n\n-- In Script B (Execution)\nif shared.OpiumwareConfig and shared.OpiumwareConfig.DebugMode then\n    print(\"Script B is running in Debug Mode!\")\nend",
    returns: "- **Table**: The shared global table.",
    notes: "The `shared` table persists for the entire duration of the game session. Be mindful of potential naming conflicts if multiple scripts use the same keys. It is a more modern and preferred alternative to the standard `_G` table in many exploit environments."
  },
  "savegame": {
    description: "Serializes the entire current game state (the `DataModel`) and saves it as a standard Roblox Place file (`.rbxl`) within the executor's workspace sandbox. This is essentially a powerful 'Save As' feature that allows you to create a local copy of any game you are currently playing, including all its parts, scripts (if accessible), and configurations.",
    usage: "savegame(\"game_dump_\" .. tostring(game.PlaceId) .. \".rbxl\")\nprint(\"The entire game state has been saved to your workspace folder.\")",
    parameters: "- **Path (string)**: The relative path and filename (including the `.rbxl` extension) where the game file should be saved.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is a very resource-intensive operation that can take several seconds or even minutes depending on the size and complexity of the game. It may cause the game to temporarily freeze during the saving process. It is a primary tool for game analysis and reverse engineering. Aliased as `saveplace()`."
  },
  "saveplace": {
    description: "[A] An alias for the `savegame` function. It serializes and saves the current place's `DataModel` to a `.rbxl` file in the workspace. This naming is common in scripts that focus on place-specific backups.",
    usage: "saveplace(\"place_backup.rbxl\")\nprint(\"Place backup completed.\")",
    parameters: "- **Path (string)**: The relative path to save the place file to.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [A] (Alias). It functions exactly like `savegame()` and is provided for script compatibility."
  },
  "makereadonly": {
    description: "Sets the read-only status of a Lua table. When a table is marked as read-only, any attempt to modify its existing keys, add new keys, or change its metatable will result in a Lua error. This is a critical security and stability tool used to protect internal data structures, configurations, or hooked metatables from being tampered with by other scripts.",
    usage: "local myConfig = { Speed = 16, JumpPower = 50 }\nmakereadonly(myConfig, true)\n\nlocal success, err = pcall(function()\n    myConfig.Speed = 100 -- This will fail\nend)\n\nif not success then\n    print(\"Table is protected: \", err)\nend",
    parameters: "- **Table (table)**: The Lua table to modify.\n- **ReadOnly (boolean)**: `true` to make the table read-only, `false` to make it writable again.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is a powerful way to enforce data integrity within your scripts. It is aliased as `make_readonly()`."
  },
  "getnilinstances": {
    description: "Returns a table containing all Roblox instances that are currently parented to `nil`. These are objects that exist in memory but are not part of the game's active hierarchy (`game`). Many anti-cheats, hidden game objects, and temporarily removed items are stored here to avoid detection by standard scripts.",
    usage: "local nilObjects = getnilinstances()\nprint(\"Found \", #nilObjects, \" instances parented to nil.\")\n\nfor _, obj in pairs(nilObjects) do\n    if obj:IsA(\"RemoteEvent\") then\n        print(\"Found hidden RemoteEvent: \", obj.Name)\n    end\nend",
    returns: "- **Table**: A list of all instances currently parented to `nil`.",
    notes: "This is a vital function for finding hidden game state and bypassing anti-cheat measures that rely on hiding objects in `nil`. Aliased as `get_nil_instances()`."
  },
  "get_hidden_gui": {
    description: "Returns a reference to a specialized, hidden GUI container managed by Opiumware. Any UI elements (like `ScreenGui`, `Frame`, etc.) parented to this container will be completely invisible to the game's standard scripts and anti-cheats, while remaining fully visible and interactive for the user. This is the safest way to implement custom menus and HUDs.",
    usage: "local myMenu = Instance.new(\"ScreenGui\")\nmyMenu.Name = \"OpiumwareMenu\"\nmyMenu.Parent = get_hidden_gui()\n\nlocal frame = Instance.new(\"Frame\", myMenu)\nframe.Size = UDim2.new(0, 200, 0, 100)\nprint(\"Custom menu is now active and hidden from game detection.\")",
    returns: "- **Instance (Folder/GuiService)**: A reference to the hidden GUI container instance.",
    notes: "Using `get_hidden_gui()` is highly recommended for any custom UI to prevent 'GUI Detection' anti-cheats from finding and banning you. It is often aliased as `gethui()`."
  },
  "restorefunction": {
    description: "Restores a function that has been previously hooked or modified back to its original, 'clean' state as it was when the game first loaded. This is essentially an 'unhook' function that removes any redirections or modifications made by `hookfunction` or `replaceclosure`.",
    usage: "local originalPrint = print\nhookfunction(print, function(...) return originalPrint(\"INTERCEPTED: \", ...) end)\n\nprint(\"Hello\") -- Output: INTERCEPTED: Hello\n\nrestorefunction(print)\nprint(\"Hello\") -- Output: Hello (Original behavior restored)",
    parameters: "- **Func (function)**: The function object to be restored.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is crucial for cleaning up after your script finishes or for temporarily disabling a hook to perform a 'clean' call to the original function. It helps in bypassing detection that checks for modified function pointers."
  },
  "disassemblefunction": {
    description: "Returns a human-readable string representation of a function's underlying Luau bytecode. This allows you to see exactly how a function is implemented at the lowest level, including its instructions, registers, and constants. It is an invaluable tool for reverse engineering complex game logic.",
    usage: "local function secretLogic(x) return x * 2 + 5 end\nlocal bytecode = disassemblefunction(secretLogic)\nprint(\"Function Bytecode Analysis:\")\nprint(bytecode)\n\n-- You can also save it to a file for deeper study\nwritefile(\"logic_dump.txt\", bytecode)",
    parameters: "- **Func (function)**: The function object to disassemble.",
    returns: "- **String**: A formatted string containing the disassembled bytecode instructions.",
    notes: "Disassembling functions is a key step in understanding how anti-cheats or complex game systems operate. It requires some knowledge of Luau bytecode to interpret effectively."
  },
  "getscriptenv": {
    description: "Retrieves the environment table (the `_G` or `shared` equivalent) of a specific Roblox script instance. This allows you to read and modify variables that are defined within that script's local or global scope, providing a powerful way to interact with game logic without directly hooking functions.",
    usage: "local targetScript = game:GetService(\"Players\").LocalPlayer.PlayerScripts.LocalMain\nlocal env = getscriptenv(targetScript)\n\nif env and env.GameVersion then\n    print(\"Target script version: \", env.GameVersion)\n    env.DebugMode = true -- Forcefully enable debug mode in the game script\nend",
    parameters: "- **Script (Instance)**: The `Script`, `LocalScript`, or `ModuleScript` instance to inspect.",
    returns: "- **Table**: The target script's environment table, or `nil` if the environment could not be accessed.",
    notes: "This function is essential for 'state-based' exploits where you modify the variables a script uses rather than its code. Aliased as `getstateenv()`."
  },
  "spoofscripthwid": {
    description: "Temporarily modifies the Hardware ID (HWID) reported to the game's scripts for the current execution context. This is a powerful privacy and anti-ban tool that prevents games from uniquely identifying your machine based on its hardware signature. It replaces the real HWID with a randomly generated or specified fake one.",
    usage: "spoofscripthwid(\"FAKE-HWID-1234-5678\")\nprint(\"HWID has been spoofed for this session.\")",
    parameters: "- **NewHWID (string, optional)**: The fake HWID string to use. If omitted, a random one is generated.",
    returns: "- **void**: This function does not return a value.",
    notes: "This only affects the HWID as seen by the game's Lua environment; it does not change your actual system HWID. It is highly effective against games that implement 'HWID Bans'."
  },
  "isourclosure": {
    description: "Checks if a given function (closure) was created by the Opiumware executor or by one of its scripts. This is a critical security and identification tool used to distinguish between 'trusted' executor-side functions and 'untrusted' game-side functions.",
    usage: "local function myFunc() end\nif isourclosure(myFunc) then\n    print(\"This function is safe and was created by Opiumware.\")\nelse\n    print(\"Warning: This is a game-side function.\")\nend",
    parameters: "- **Func (function)**: The function object to check.",
    returns: "- **Boolean**: `true` if the function was created by the executor, `false` otherwise.",
    notes: "This is often used in hooks to prevent infinite recursion (e.g., a hook calling itself). Aliased as `isexecutorclosure()` and `is_synapse_function()`."
  },
  "isexploitclosure": {
    description: "[A] An alias for `isourclosure`. It checks if the provided function was originated from the exploit's environment. This naming is common in cross-executor script development.",
    usage: "if isexploitclosure(someFunc) then ... end",
    parameters: "- **Func (function)**: The function to check.",
    returns: "- **Boolean**: `true` if it's an exploit-created function.",
    notes: "Marked as [A] (Alias). Functions identically to `isourclosure()`."
  },
  "issynapsefunct": {
    description: "[A] A legacy alias for `isourclosure`, maintained for compatibility with scripts originally written for Synapse X. It identifies if a function is internal to the executor.",
    usage: "if issynapsefunct(print) then print(\"Print is an executor function!\") end",
    parameters: "- **Func (function)**: The function to check.",
    returns: "- **Boolean**: `true` if it's an executor function.",
    notes: "Marked as [A] (Alias). Functions identically to `isourclosure()`."
  },
  "getactorfromstate": {
    description: "Retrieves the `Actor` instance associated with a specific Lua state (thread). In Roblox's parallel Luau architecture, different actors run in separate Lua states. This function allows you to identify which actor a particular thread belongs to.",
    usage: "local myActor = getactorfromstate(coroutine.running())\nif myActor then\n    print(\"Current thread is running inside Actor: \", myActor.Name)\nend",
    parameters: "- **State (thread)**: The Lua thread/state to inspect.",
    returns: "- **Instance (Actor)**: The `Actor` instance associated with the state, or `nil` if not found.",
    notes: "This is an advanced function used for debugging and interacting with parallel Luau systems. Aliased as `get_actor_from_state()`."
  },
  "getactorstates": {
    description: "Returns a table containing all active Lua states (threads) that are currently associated with `Actor` instances in the game. This provides a comprehensive view of all parallel execution contexts.",
    usage: "local actorThreads = getactorstates()\nprint(\"Found \", #actorThreads, \" active actor threads.\")",
    returns: "- **Table**: A list of Lua threads associated with actors.",
    notes: "Useful for monitoring or manipulating parallel execution across the entire game. Aliased as `get_actor_states()`."
  },
  "run_on_actor_thread": {
    description: "Forcefully executes a provided function within the Lua state of a specific `Actor`. This allows you to 'inject' code into a parallel execution context, enabling direct interaction with actor-local data and logic.",
    usage: "local targetActor = game:GetService(\"Actors\"):FindFirstChild(\"WorkerActor\")\nrun_on_actor_thread(targetActor, function()\n    print(\"Now running inside the worker actor's thread!\")\nend)",
    parameters: "- **Actor (Instance)**: The target `Actor` instance.\n- **Func (function)**: The function to execute.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is a very powerful and potentially dangerous function. Use it with caution as it can cause crashes if not handled correctly. Aliased as `run_on_actor()`."
  },
  "setallprotosinactive": {
    description: "Iterates through all function prototypes currently loaded in the Lua VM and marks them as inactive. This is a 'nuclear option' that can be used to completely disable all game logic or scripts in a single call.",
    usage: "setallprotosinactive()\nprint(\"All game functions have been neutralized.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "This will almost certainly crash the game or render it completely unplayable. It is primarily used for testing or extreme 'kill-switch' scenarios."
  },
  "comparefunction": {
    description: "Performs a deep comparison between two functions to determine if they are functionally identical, even if they are different objects in memory. This is useful for identifying if a game has 'cloned' a function to try and bypass hooks.",
    usage: "local func1 = function() return 1 end\nlocal func2 = function() return 1 end\nif comparefunction(func1, func2) then\n    print(\"The functions are identical in implementation.\")\nend",
    parameters: "- **Func1 (function)**: The first function to compare.\n- **Func2 (function)**: The second function to compare.",
    returns: "- **Boolean**: `true` if the functions are identical, `false` otherwise.",
    notes: "This comparison is based on the underlying bytecode and constants of the functions."
  },
  "setcallbackvalue": {
    description: "Sets a value within a specialized 'callback' storage area managed by the executor. This is often used for passing data between the executor's core and user scripts in a secure and structured way.",
    usage: "setcallbackvalue(\"MyKey\", \"SomeData\")",
    parameters: "- **Key (string)**: The unique key for the value.\n- **Value (any)**: The data to store.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is an internal-facing function primarily used by advanced script developers."
  },
  "getcallbackthread": {
    description: "Retrieves the Lua thread (coroutine) that is currently associated with a specific callback key.",
    usage: "local thread = getcallbackthread(\"OnUpdate\")",
    parameters: "- **Key (string)**: The unique key for the callback.",
    returns: "- **Thread**: The associated Lua thread, or `nil` if not found.",
    notes: "Advanced debugging and synchronization tool."
  },
  "getcallbackvalue": {
    description: "Retrieves a value previously stored using `setcallbackvalue`.",
    usage: "local data = getcallbackvalue(\"MyKey\")\nprint(\"Retrieved callback data: \", data)",
    parameters: "- **Key (string)**: The unique key for the value.",
    returns: "- **any**: The stored value, or `nil` if not found.",
    notes: "Used for secure data exchange between script components."
  },
  "overridemalicious": {
    description: "Enables or disables a specialized protection layer that intercepts and blocks potentially 'malicious' Lua operations, such as those that attempt to crash the executor or access sensitive system information.",
    usage: "overridemalicious(true)\nprint(\"Malicious script protection is now active.\")",
    parameters: "- **Enabled (boolean)**: `true` to enable protection, `false` to disable.",
    returns: "- **void**: This function does not return a value.",
    notes: "It is highly recommended to keep this enabled when running untrusted scripts."
  },
  "getgc": {
    description: "Returns a table containing all objects currently tracked by the Lua garbage collector. This includes every table, function, userdata, and thread in the Lua VM. It is the ultimate tool for 'scanning' the entire game's memory for specific data or logic.",
    usage: "local allObjects = getgc()\nfor _, obj in pairs(allObjects) do\n    if type(obj) == \"table\" and obj.AdminList then\n        print(\"Found the game's admin list!\")\n    end\nend",
    parameters: "- **IncludeTables (boolean, optional)**: If `true`, includes tables in the result. Defaults to `false` for performance.",
    returns: "- **Table**: A massive list of all objects in the Lua VM.",
    notes: "This is an extremely resource-intensive function. Use it sparingly and avoid iterating over the entire result every frame. It is often aliased as `get_gc_objects()`."
  },
  "getreg": {
    description: "Returns the Lua Registry table. This is a special, hidden table used by the Lua VM and C-side extensions to store persistent data, including references to all loaded libraries, active threads, and internal state. It is the 'root' of the Lua environment.",
    usage: "local registry = getreg()\nprint(\"Registry size: \", #registry)",
    returns: "- **Table**: The Lua Registry table.",
    notes: "Directly modifying the registry is extremely dangerous and can easily lead to instant crashes. It is primarily used for deep inspection of the Lua VM state. Aliased as `get_registry()`."
  },
  "gettenv": {
    description: "Retrieves the environment table of a specific Lua thread (coroutine). This allows you to inspect and modify the variables accessible to that particular thread, which may be different from the global environment.",
    usage: "local myThread = coroutine.create(function() local x = 1 end)\nlocal env = gettenv(myThread)\nenv.x = 100 -- Modify the thread's local state",
    parameters: "- **Thread (thread)**: The Lua thread to inspect.",
    returns: "- **Table**: The thread's environment table.",
    notes: "Useful for debugging and manipulating complex multi-threaded scripts. Aliased as `get_thread_env()`."
  },
  "getrobloxenv": {
    description: "Returns the 'original' Roblox global environment (`getfenv(0)` equivalent) as it would be seen by a standard, unprivileged game script. This allows you to see exactly what functions and variables are available to the game's own logic.",
    usage: "local rbxEnv = getrobloxenv()\nif rbxEnv.print == print then\n    print(\"The global print function has not been hooked by the game.\")\nend",
    returns: "- **Table**: The standard Roblox global environment table.",
    notes: "This is crucial for identifying if a game has modified its own environment to detect exploits. Aliased as `get_rbx_env()`."
  },
  "cansignalreplicate": {
    description: "Checks if a specific `RBXScriptSignal` (event) is configured to replicate its triggers across the network (from client to server or vice versa).",
    usage: "local signal = game.ChildAdded\nif cansignalreplicate(signal) then\n    print(\"This signal replicates across the network.\")\nend",
    parameters: "- **Signal (RBXScriptSignal)**: The signal to check.",
    returns: "- **Boolean**: `true` if the signal replicates, `false` otherwise.",
    notes: "Important for understanding network behavior and identifying potential 'Remote' vulnerabilities."
  },
  "getsignalarguments": {
    description: "Returns the arguments that were passed to the most recent trigger of a specific `RBXScriptSignal`. This allows you to 'intercept' the data sent to event handlers.",
    usage: "local signal = game.Players.LocalPlayer.Chatted\n-- Wait for user to chat...\nlocal args = getsignalarguments(signal)\nprint(\"User chatted: \", args[1])",
    parameters: "- **Signal (RBXScriptSignal)**: The signal to inspect.",
    returns: "- **Table**: A list of arguments from the last trigger.",
    notes: "Powerful for analyzing how the game responds to events."
  },
  "http_request": {
    description: "[A] An alias for the `request` function. It performs a highly customizable HTTP request, supporting various methods (GET, POST, PUT, DELETE, etc.), headers, and body data. This is the primary way for scripts to communicate with external web services.",
    usage: "local response = http_request({\n    Url = \"https://api.ipify.org?format=json\",\n    Method = \"GET\",\n    Headers = {\n        [\"Content-Type\"] = \"application/json\"\n    }\n})\n\nif response.Success then\n    print(\"Response Body: \", response.Body)\nend",
    parameters: "- **Options (table)**: A configuration table containing:\n    - `Url` (string): The target URL.\n    - `Method` (string): HTTP method (e.g., \"POST\").\n    - `Headers` (table): Optional HTTP headers.\n    - `Body` (string): Optional request body.\n    - `Cookies` (table): Optional cookies to send.",
    returns: "- **Table**: A response table containing:\n    - `Success` (boolean): Whether the request succeeded.\n    - `StatusCode` (number): HTTP status code (e.g., 200).\n    - `StatusMessage` (string): HTTP status message.\n    - `Headers` (table): Response headers.\n    - `Body` (string): The response body content.",
    notes: "Requests are subject to the executor's security policies and may be blocked if targeting sensitive domains."
  },
  "script": {
    description: "A global variable that always points to a 'fake' `LocalScript` instance representing the currently executing script. This allows scripts to use standard Roblox patterns like `script.Parent` or `script.Name` even when they are injected and don't physically exist in the game hierarchy.",
    usage: "print(\"Current script name: \", script.Name)\nscript.Name = \"OpiumwareInjected\"\nprint(\"New script name: \", script.Name)",
    returns: "- **Instance (LocalScript)**: A reference to the proxy script instance.",
    notes: "This is a vital compatibility feature that makes injected scripts behave more like native game scripts."
  },
  "getthreadidentity": {
    description: "Returns the current 'Thread Identity' (also known as Context Level) of the executing Lua thread. This identity determines what permissions the script has (e.g., whether it can access restricted game services or modify protected instances).",
    usage: "local identity = getthreadidentity()\nprint(\"Current Thread Identity: \", identity)\n-- Identity 6 or 7 usually indicates elevated executor permissions.",
    returns: "- **Number**: The current thread identity level.",
    notes: "Understanding your identity level is key to knowing what operations your script can perform. Aliased as `get_thread_context()`."
  },
  "setthreadidentity": {
    description: "Forcefully changes the 'Thread Identity' of the current Lua thread. This can be used to elevate permissions (to access restricted services) or lower them (to bypass identity-based detection).",
    usage: "setthreadidentity(7) -- Elevate to maximum permissions\nprint(\"Thread identity elevated to 7.\")",
    parameters: "- **Identity (number)**: The new identity level to set (typically 0-8).",
    returns: "- **void**: This function does not return a value.",
    notes: "Elevating identity is a common technique for bypassing 'Permission Denied' errors when accessing sensitive game objects. Aliased as `set_thread_context()`."
  },
  "getproperties": {
    description: "Returns a table containing all properties (both standard and hidden) of a Roblox instance, along with their current values. This provides a complete 'snapshot' of an object's state.",
    usage: "local part = Instance.new(\"Part\")\nlocal props = getproperties(part)\nprint(\"Part Color: \", props.Color)\nprint(\"Part Transparency: \", props.Transparency)",
    parameters: "- **Obj (Instance)**: The Roblox instance to inspect.",
    returns: "- **Table**: A dictionary where keys are property names and values are their current values.",
    notes: "This is much more comprehensive than standard property access as it includes hidden and internal properties. Aliased as `get_properties()`."
  },
  "gethiddenproperties": {
    description: "Specifically retrieves only the 'hidden' or 'internal' properties of a Roblox instance that are not normally accessible to standard game scripts. These properties often contain sensitive state or configuration data.",
    usage: "local player = game.Players.LocalPlayer\nlocal hiddenProps = gethiddenproperties(player)\n-- Hidden properties might include internal IDs or networking state.",
    parameters: "- **Obj (Instance)**: The Roblox instance to inspect.",
    returns: "- **Table**: A dictionary of hidden property names and values.",
    notes: "Essential for deep analysis of game objects and bypassing restrictions. Aliased as `get_hidden_properties()`."
  },
  "getrawmetatable": {
    description: "Returns the 'raw' metatable of a Roblox instance or a Lua table, bypassing the standard `__metatable` protection. This allows you to directly inspect and modify the behavior of game objects, such as hooking `__namecall` or `__index`.",
    usage: "local mt = getrawmetatable(game)\nlocal originalNamecall = mt.__namecall\n\nsetreadonly(mt, false)\nmt.__namecall = newcclosure(function(self, ...)\n    print(\"Namecall intercepted: \", getnamecallmethod())\n    return originalNamecall(self, ...)\nend)\nsetreadonly(mt, true)",
    parameters: "- **Obj (any)**: The object whose metatable you want to retrieve.",
    returns: "- **Table**: The raw metatable of the object.",
    notes: "This is the foundation of most advanced Roblox exploits. It allows for powerful 'Method Hooking' and behavior modification. Aliased as `get_raw_metatable()`."
  },
  "setrawmetatable": {
    description: "Forcefully replaces the metatable of an object with a new one, bypassing all standard Lua protections. This is an extremely powerful and dangerous function that can completely redefine how an object behaves.",
    usage: "local myTable = {}\nlocal myMT = { __index = function() return \"Intercepted!\" end }\nsetrawmetatable(myTable, myMT)\nprint(myTable.anything) -- Output: Intercepted!",
    parameters: "- **Obj (any)**: The target object.\n- **MT (table)**: The new metatable to apply.",
    returns: "- **void**: This function does not return a value.",
    notes: "Use with extreme caution. Setting an incorrect metatable on a Roblox instance will lead to an immediate crash. Aliased as `set_raw_metatable()`."
  },
  "isreadonly": {
    description: "Determines if a Lua table is currently 'frozen' or 'read-only'. In this state, any attempt to modify existing keys, add new keys, or remove keys will result in a Lua error. This is a standard protection mechanism used by Roblox for its internal engine tables and metatables to prevent accidental or malicious modification.",
    usage: "local mt = getrawmetatable(game)\nif isreadonly(mt) then\n    print(\"The game's metatable is currently locked and cannot be modified.\")\nelse\n    print(\"The game's metatable is writable.\")\nend",
    parameters: "- **Table (table)**: The Lua table to inspect.",
    returns: "- **Boolean**: `true` if the table is read-only (frozen), `false` if it is writable.",
    notes: "This is a critical check to perform before attempting to hook or modify any internal game tables. Use `setreadonly` to change this state."
  },
  "make_readonly": {
    description: "[A] [PS] A legacy alias for the `setreadonly` function. It allows you to toggle the 'frozen' state of a Lua table. By setting a table to non-read-only (writable), you can modify its contents, which is essential for advanced techniques like metatable hooking or environment manipulation.",
    usage: "local mt = getrawmetatable(game)\n-- Unlock the metatable for hooking\nmake_readonly(mt, false)\nprint(\"Metatable is now writable. Proceeding with hooks...\")\n-- ... apply hooks ...\n-- Re-lock the metatable for safety\nmake_readonly(mt, true)\nprint(\"Metatable re-locked.\")",
    parameters: "- **Table (table)**: The target Lua table to modify.\n- **ReadOnly (boolean)**: `true` to make the table read-only (locked), `false` to make it writable (unlocked).",
    returns: "- **void**: This function does not return a value.",
    notes: "Always remember to re-lock internal tables after you've finished modifying them to maintain stability and avoid detection. Aliased as `set_readonly()`."
  },
  "keyclickmac": {
    description: "Simulates a full keyboard 'click' (a rapid press and release sequence) for a specific key, specifically designed for scripts running on the macOS version of Roblox. This is a vital tool for automating user input, such as triggering abilities or navigating menus, without requiring physical keyboard interaction.",
    usage: "keyclickmac(Enum.KeyCode.E) -- Simulate pressing 'E' to interact\nprint(\"Simulated 'E' key click on macOS.\")",
    parameters: "- **KeyCode (KeyCode)**: The standard Roblox `Enum.KeyCode` representing the key to be clicked.",
    returns: "- **void**: This function does not return a value.",
    notes: "This function is platform-specific and will likely have no effect on Windows or mobile versions of the game. For Windows, use `keypress` and `keyrelease`."
  },
  "base64_encode": {
    description: "[A] A convenient alias for `base64encode`. It converts a raw string of data into a Base64 encoded string. Base64 encoding is a standard method for representing binary data in an ASCII string format, making it safe for transmission over text-based protocols like HTTP or for storage in JSON files.",
    usage: "local secretData = \"Opiumware is the best!\"\nlocal encoded = base64_encode(secretData)\nprint(\"Encoded Data: \", encoded)\n-- Output: T3BpdW13YXJlIGlzIHRoZSBiZXN0IQ==",
    parameters: "- **Data (string)**: The raw string or binary data you wish to encode.",
    returns: "- **String**: The resulting Base64 encoded string.",
    notes: "Essential for sending complex data structures or binary assets to external web APIs using `http_request`. Aliased as `base64encode()`."
  },
  "LuaStateProxy.new": {
    description: "Creates and initializes a new `LuaStateProxy` instance. This object serves as a powerful manager for creating and controlling secondary, isolated Lua states within the game process. This is an extremely advanced feature used for running scripts in complete isolation from the main game environment or for complex multi-threaded operations.",
    usage: "local proxy = LuaStateProxy.new()\nprint(\"New LuaStateProxy initialized. Ready for isolated execution.\")",
    returns: "- **LuaStateProxy**: A new instance of the `LuaStateProxy` class.",
    notes: "Isolated states created via this proxy have their own global environments and registries, providing a high degree of security and stability for complex tools."
  },
  "LuaStateProxy:Execute": {
    description: "Executes a provided string of Lua source code within the isolated Lua state managed by the `LuaStateProxy` instance. The code runs in its own environment, meaning it won't directly interfere with the variables or state of the main calling script unless explicitly designed to do so.",
    usage: "local proxy = LuaStateProxy.new()\nproxy:Execute([[\n    print(\"Hello from an isolated Lua state!\")\n    _G.IsolatedVar = \"I am hidden from the main state\"\n]])",
    parameters: "- **Code (string)**: The Lua source code to be executed within the proxy state.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is the primary method for running 'sandbox' scripts or performing background tasks without affecting the main game thread."
  },
  "LuaStateProxy:GetActors": {
    description: "Retrieves an array of all `Actor` instances that are currently associated with or being managed by the `LuaStateProxy`. Actors are the fundamental units of Roblox's parallel Luau system, and this function allows you to coordinate tasks across multiple parallel threads.",
    usage: "local proxy = LuaStateProxy.new()\nlocal actors = proxy:GetActors()\nprint(\"The proxy is currently managing \" .. #actors .. \" parallel actors.\")",
    returns: "- **Table**: A list (array) of `Actor` instances.",
    notes: "Essential for scripts that leverage parallel execution to perform heavy computations without lagging the main game loop."
  },
  "invalidate": {
    description: "Forcefully invalidates a specific object, environment, or internal cache entry within the executor. This is typically used to clear stale data, force the engine to re-evaluate an object's state, or to bypass certain types of object-based detection by making the object appear 'invalid' or 'destroyed' to the engine's internal checks.",
    usage: "local part = game.Workspace.Part\n-- Force the engine to re-fetch the part's state\ninvalidate(part)\nprint(\"Object reference invalidated in internal cache.\")",
    parameters: "- **Object (Variant)**: The Roblox instance, table, or reference to be invalidated.",
    returns: "- **void**: This function does not return a value.",
    notes: "This is a low-level function. Invalidating critical engine objects or active script environments can lead to immediate instability or crashes."
  },
  "isvalidlevel": {
    description: "Verifies if a specific security identity level (often referred to as 'Thread Identity' or 'Context Level') is considered valid and supported within the current execution environment. This allows scripts to dynamically check their own capabilities before attempting to perform actions that require elevated permissions.",
    usage: "local targetLevel = 7\nif isvalidlevel(targetLevel) then\n    print(\"Level \" .. targetLevel .. \" is supported. Proceeding with elevated tasks.\")\nelse\n    print(\"Warning: Level \" .. targetLevel .. \" is not valid in this environment.\")\nend",
    parameters: "- **Level (number)**: The integer identity level (typically 0-9) to verify.",
    returns: "- **Boolean**: `true` if the level is valid and supported, `false` otherwise.",
    notes: "While most executors support up to level 7 or 8, some environments may have stricter limits."
  },
  "getcommunicationchannel": {
    description: "Retrieves the unique identifier or name of the internal communication channel used by the executor for inter-process communication (IPC). This channel is used for passing messages and data between the executor's core engine and the injected script environment.",
    usage: "local channelName = getcommunicationchannel()\nprint(\"Active Executor IPC Channel: \", channelName)",
    returns: "- **String**: The name of the active communication channel.",
    notes: "This is an internal diagnostic function and is rarely needed for standard script development."
  },
  "setnonreplicatedproperty": {
    description: "[NH] [NR] [B] Sets a property on a Roblox Instance such that the change is strictly local and is NOT replicated to the game server. This is an incredibly powerful tool for modifying your own character's properties (like `WalkSpeed`, `JumpPower`, or `HipHeight`) without the server being notified, which can effectively bypass many server-side anti-cheat checks that monitor for abnormal movement.",
    usage: "local humanoid = game.Players.LocalPlayer.Character.Humanoid\n-- Set speed to 100 locally only\nsetnonreplicatedproperty(humanoid, \"WalkSpeed\", 100)\nprint(\"Local WalkSpeed set to 100. Server still sees default speed.\")",
    parameters: "- **Instance (Instance)**: The Roblox object to modify.\n- **Property (string)**: The name of the property to change.\n- **Value (Variant)**: The new value to set locally.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [B] (Beta) and [NR] (No Replicate). While powerful, some advanced anti-cheats may still detect the effects of these changes (e.g., by measuring the distance you travel over time)."
  },
  "isluau": {
    description: "Returns a boolean indicating whether the current game environment is running Luau, Roblox's custom, high-performance evolution of Lua 5.1. Luau features significant optimizations, a powerful type system, and new syntax features (like generalized iteration and string interpolation) that are not available in standard Lua.",
    usage: "if isluau() then\n    print(\"Luau detected! Leveraging high-performance features.\")\nelse\n    print(\"Standard Lua 5.1 detected.\")\nend",
    returns: "- **Boolean**: `true` if the environment is Luau, `false` if it is standard Lua.",
    notes: "Opiumware is optimized for Luau and supports all of its advanced features."
  },
  "getmenv": {
    description: "[A] Retrieves the global environment table (`_G` or `getfenv()`) of a specified `ModuleScript`. This allows you to directly access and modify the internal variables, local functions, and state of a module even if they are not explicitly exposed via the module's return table.",
    usage: "local module = game.ReplicatedStorage.GameSettings\nlocal env = getmenv(module)\n\nif env then\n    print(\"Module Internal Version: \", env.VERSION_STRING)\n    -- Forcefully enable a hidden feature\n    env.ENABLE_EXPERIMENTAL_UI = true\nend",
    parameters: "- **ModuleScript (Instance)**: The target `ModuleScript` instance to inspect.",
    returns: "- **Table**: The environment table of the module, or `nil` if it cannot be retrieved.",
    notes: "This is a key function for 'Module Hooking' and modifying game logic that is encapsulated within modules. Aliased as `get_module_env()`."
  },
  "is_synapse_function": {
    description: "Checks if a given Lua function is an internal, built-in function provided by the Opiumware executor (or a compatible environment like Synapse X). This is useful for scripts to determine if they are running in a supported environment and to verify the authenticity of certain functions.",
    usage: "if is_synapse_function(getgc) then\n    print(\"getgc is a trusted executor function.\")\nend\n\nif not is_synapse_function(print) then\n    print(\"print is a standard Roblox/Lua function.\")\nend",
    parameters: "- **Func (function)**: The function to check.",
    returns: "- **Boolean**: `true` if the function is a built-in executor function, `false` otherwise.",
    notes: "Useful for building environment-aware scripts and for basic security checks. Aliased as `is_opiumware_function()`."
  },
  "is_protosmasher_caller": {
    description: "[A] [PS] A legacy alias for the `checkcaller` function. It determines if the current thread of execution was initiated by the exploit environment (the executor) rather than a standard Roblox game script. This is absolutely critical for writing safe hooks to ensure your script doesn't accidentally intercept its own calls or calls from the executor's core systems.",
    usage: "local oldIndex\noldIndex = hookmetamethod(game, \"__index\", function(t, k)\n    -- Only intercept calls from the game, not from our own script\n    if not is_protosmasher_caller() then\n        if k == \"WalkSpeed\" then return 16 end -- Spoof WalkSpeed to game scripts\n    end\n    return oldIndex(t, k)\nend)",
    returns: "- **Boolean**: `true` if the caller is the exploit environment, `false` if it is a game script.",
    notes: "Always use this in metatable hooks to prevent infinite recursion and to stay hidden from game-side detection. Aliased as `checkcaller()`."
  },
  "replaceclosure": {
    description: "[NR] [PS] Forcefully replaces the internal implementation of one Lua function (closure) with another. Unlike `hookfunction`, which redirects calls at the Lua level, `replaceclosure` attempts to swap the underlying C-level function data. This is an extremely low-level and inherently unstable operation that can easily lead to crashes if the function signatures or environments don't match perfectly.",
    usage: "local function myNewPrint(...)\n    warn(\"Print Intercepted: \", ...)\nend\n\n-- Swap the real print with our custom one\nreplaceclosure(print, myNewPrint)\nprint(\"This message will now appear as a warning.\")",
    parameters: "- **FuncA (function)**: The target function to be replaced.\n- **FuncB (function)**: The new function implementation to inject.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [NR] (No Replicate) and [PS] (ProtoSmasher). This is considered a 'last resort' hooking method and should be avoided in favor of `hookfunction` whenever possible. Aliased as `replace_closure()`."
  },
  "getinstancefromstate": {
    description: "Retrieves the Roblox `Instance` (typically a `Script`, `LocalScript`, or `ModuleScript`) that is associated with a specific Lua state or thread. This is a vital tool for reverse engineers to map active threads found in memory (via `getgc` or `getreg`) back to the physical script objects that created them.",
    usage: "for _, obj in pairs(getgc()) do\n    if type(obj) == \"thread\" then\n        local sourceScript = getinstancefromstate(obj)\n        if sourceScript then\n            print(\"Found active thread belonging to: \", sourceScript:GetFullName())\n        end\n    end\nend",
    parameters: "- **Thread (thread)**: The Lua thread or state to inspect.",
    returns: "- **Instance**: The associated script instance, or `nil` if the thread is not tied to a specific Roblox object.",
    notes: "Essential for identifying the source of malicious or suspicious background threads. Aliased as `get_instance_from_state()`."
  },
  "validfgwindow": {
    description: "Checks if the Roblox game client is currently the 'foreground' or active window on the user's operating system. This is a useful utility for scripts that perform automated actions (like clicking or typing) to ensure they only run when the user is actually focused on the game, preventing accidental input into other applications.",
    usage: "spawn(function()\n    while wait(0.5) do\n        if not validfgwindow() then\n            -- Pause automation if the user alt-tabs away\n            print(\"Game unfocused. Automation paused.\")\n        end\n    end\nend)",
    returns: "- **Boolean**: `true` if the Roblox window is currently focused, `false` otherwise.",
    notes: "Helps maintain stealth and prevents 'bot-like' behavior when the game is minimized. Aliased as `is_game_focused()`."
  },
  "getstates": {
    description: "[?] Returns a table containing all active global Lua states currently managed by the Roblox engine. This is an extremely advanced and potentially unstable function that provides a direct look into the engine's internal multi-state architecture.",
    usage: "local allStates = getstates()\nprint(\"Total Active Lua States: \", #allStates)\nfor i, state in ipairs(allStates) do\n    print(\"State \" .. i .. \" Pointer: \", state)\nend",
    returns: "- **Table**: A list of pointers or objects representing the active Lua states.",
    notes: "Marked as [?] (Unknown/Unstable). Directly interacting with or modifying these states is highly likely to cause an immediate crash. Aliased as `get_all_states()`."
  },
  "get_instances": {
    description: "[A] [PS] A legacy alias for `getinstances`. It returns a massive array containing every single Roblox `Instance` that is currently instantiated in the game process's memory. This includes objects parented to the `DataModel`, objects parented to `nil`, and internal objects that are normally hidden from the `game` hierarchy.",
    usage: "local instances = get_instances()\nprint(\"Total instances in memory: \", #instances)\n\n-- Search for a hidden 'AntiCheat' object\nfor _, ins in pairs(instances) do\n    if ins.Name == \"AntiCheatConfig\" then\n        print(\"Found hidden config at: \", ins:GetFullName())\n    end\nend",
    returns: "- **Table**: A list of all `Instance` objects currently in memory.",
    notes: "This function can be extremely slow and memory-intensive in large games. Use sparingly. Aliased as `getinstances()`."
  },
  "get_nil_instances": {
    description: "[A] [PS] A legacy alias for `getnilinstances`. It returns a table containing all Roblox `Instance` objects that are currently parented to `nil`. This is a primary tool for finding hidden game logic, as many anti-cheats and complex systems store their components in `nil` to avoid being found by standard `game:FindFirstChild` loops.",
    usage: "local nilObjects = get_nil_instances()\nprint(\"Found \" .. #nilObjects .. \" objects parented to nil.\")\n\nfor _, obj in pairs(nilObjects) do\n    if obj:IsA(\"RemoteEvent\") then\n        print(\"Found hidden RemoteEvent: \", obj.Name)\n    end\nend",
    returns: "- **Table**: A list of all instances whose `Parent` is `nil`.",
    notes: "Essential for bypassing 'hidden' detection mechanisms. Aliased as `getnilinstances()`."
  },
  "getnamecallmethod": {
    description: "Retrieves the name of the method currently being invoked during a `__namecall` metamethod call. This is the primary way to identify which Roblox method (such as `FireServer`, `InvokeServer`, `Destroy`, or `FindFirstChild`) is being called on an object when you have hooked the `__namecall` metamethod.",
    usage: "local oldNamecall\noldNamecall = hookmetamethod(game, \"__namecall\", function(self, ...)\n    local method = getnamecallmethod()\n    if method == \"FireServer\" then\n        print(\"Intercepted RemoteEvent fire on: \", self:GetFullName())\n    end\n    return oldNamecall(self, ...)\nend)",
    returns: "- **String**: The name of the method being called.",
    notes: "This function will only return a valid string when called inside a `__namecall` hook. Outside of this context, it will typically return `nil` or an empty string. Aliased as `get_namecall_method()`."
  },
  "setnamecallmethod": {
    description: "Allows you to dynamically change or 'spoof' the method name during a `__namecall` metamethod call. This is an advanced technique used to redirect a method call to a different one, effectively tricking the game engine or other scripts into performing a different action than originally intended.",
    usage: "local oldNamecall\noldNamecall = hookmetamethod(game, \"__namecall\", function(self, ...)\n    local method = getnamecallmethod()\n    if method == \"Kick\" then\n        -- Redirect 'Kick' to a harmless 'print' call\n        setnamecallmethod(\"print\")\n        warn(\"Blocked an attempt to kick the local player!\")\n    end\n    return oldNamecall(self, ...)\nend)",
    parameters: "- **Method (string)**: The new method name to substitute for the current call.",
    returns: "- **void**: This function does not return a value.",
    notes: "Use with extreme caution. Redirecting to a method with a different argument signature will almost certainly cause a crash. Aliased as `set_namecall_method()`."
  },
  "gbmt": {
    description: "[A] Returns the 'Global Base Metatable' - the original, pristine metatable of the `game` object as it existed before any modifications or hooks were applied. This is an essential tool for bypassing 'metatable-based' anti-cheats that attempt to detect or block script interaction by hooking the standard `game` metatable.",
    usage: "local originalMT = gbmt()\nlocal realIndex = originalMT.__index\n\n-- Use the original __index to access Workspace safely\nlocal workspace = realIndex(game, \"Workspace\")\nprint(\"Accessed Workspace via original metatable.\")",
    returns: "- **Table**: The original, unmodified metatable of the `game` instance.",
    notes: "Provides a clean slate for interacting with the game's core object, bypassing any hooks placed on the standard `game` object. Aliased as `getrawmetatable(game)`."
  },
  "XPROTECT": {
    description: "[SH] A specialized function for executing a string of Lua code within a 'protected' and isolated environment. This is designed to provide a layer of stealth and isolation, making the script's execution harder to detect by certain types of game-side monitoring and anti-cheat systems.",
    usage: "XPROTECT([[\n    local secret = \"This code is running in a protected shell\"\n    print(secret)\n]])",
    parameters: "- **Script (string)**: The Lua source code to be executed within the protected environment.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [SH] (SirHurt). This is primarily included for compatibility with scripts and tools originally developed for the SirHurt executor."
  },
  "getconstants": {
    description: "[A] A legacy alias for `debug.getconstants`. It returns a table containing all the 'constant' values (such as literal strings, numbers, booleans, and `nil`) that are defined and used within a specific Lua function. This is a fundamental tool for reverse engineering script logic and extracting hardcoded data.",
    usage: "local function secretFunc()\n    local key = \"API_KEY_12345\"\n    local limit = 100\nend\n\nlocal constants = getconstants(secretFunc)\nfor i, val in ipairs(constants) do\n    print(\"Constant \" .. i .. \": \", val)\nend",
    parameters: "- **Func (function)**: The target Lua function to inspect.",
    returns: "- **Table**: An array containing all constants found within the function's bytecode.",
    notes: "Essential for finding hidden URLs, keys, or logic flags within game scripts. Aliased as `debug.getconstants()`."
  },
  "hookfunc": {
    description: "[A] A legacy alias for the powerful `hookfunction`. It allows you to intercept every call to a specific Lua or C function and redirect it to your own custom implementation. This is the cornerstone of most advanced game modifications, enabling you to change how the game behaves at a fundamental level.",
    usage: "local oldPrint\noldPrint = hookfunc(print, function(...)\n    -- Add a prefix to every print message\n    return oldPrint(\"[Opiumware] \", ...)\nend)\n\nprint(\"Hello World!\") -- Output: [Opiumware] Hello World!",
    parameters: "- **F1 (function)**: The target function you wish to hook.\n- **F2 (function)**: Your custom 'hook' function that will be called instead.",
    returns: "- **Function**: The original, unhooked version of the function. **You MUST save this** to call the original logic within your hook.",
    notes: "Always ensure your hook function returns the same number and type of values as the original to prevent game errors. Aliased as `hookfunction()`."
  },
  "get_calling_script": {
    description: "[A] [PS] A legacy alias for `getcallingscript`. It returns a reference to the `Script`, `LocalScript`, or `ModuleScript` instance that is responsible for the current function call. This is an essential security tool for scripts to verify the identity of their callers and to prevent unauthorized access to sensitive functions.",
    usage: "local function protectedAPI()\n    local caller = get_calling_script()\n    if caller and caller.Name == \"MaliciousScript\" then\n        warn(\"Blocked call from unauthorized script!\")\n        return\n    end\n    print(\"API called by: \", caller:GetFullName())\nend",
    returns: "- **Instance**: The script instance that initiated the call, or `nil` if the call originated from the executor or a raw thread.",
    notes: "Marked as [A] (Alias) and [PS] (ProtoSmasher). This is a vital component for building robust 'internal' security systems within your scripts. Aliased as `getcallingscript()`."
  },
  "get_scripts": {
    description: "[A] [PS] A legacy alias for `getscripts`. It returns a comprehensive array containing every single `Script`, `LocalScript`, and `ModuleScript` currently existing within the game's DataModel. This allows you to easily find, inspect, and potentially modify any script in the game.",
    usage: "local allScripts = get_scripts()\nprint(\"Total scripts found in game: \", #allScripts)\n\nfor _, s in pairs(allScripts) do\n    if s:IsA(\"LocalScript\") and s.Name:find(\"AntiCheat\") then\n        print(\"Potential Anti-Cheat found: \", s:GetFullName())\n    end\nend",
    returns: "- **Table**: A list of all script instances currently in the game hierarchy.",
    notes: "Useful for performing global script analysis or for finding specific game systems to hook. Aliased as `getscripts()`."
  },
  "getstack": {
    description: "[A] A legacy alias for `debug.getstack`. It retrieves a table representing the internal Lua stack at a specified level. This provides a deep look into the execution state of a function, allowing you to see local variables, temporary values, and the current state of the function's logic.",
    usage: "local function complexLogic()\n    local secretKey = \"XYZ-123\"\n    local internalState = { active = true }\n    -- Inspect the current stack (level 1)\n    local stack = getstack(1)\n    for i, val in pairs(stack) do\n        print(\"Stack Index \" .. i .. \": \", val)\n    end\nend\ncomplexLogic()",
    parameters: "- **Level (number)**: The stack level to inspect (1 is the current function, 2 is the caller, etc.).",
    returns: "- **Table**: A dictionary-like table where keys are stack indices and values are the corresponding stack entries.",
    notes: "An extremely powerful tool for reverse engineering and debugging complex game logic. Aliased as `debug.getstack()`."
  },
  "setstack": {
    description: "[A] A legacy alias for `debug.setstack`. It allows you to directly modify a value at a specific index on the Lua stack at a given level. This is an incredibly powerful (and dangerous) function that can be used to change the values of local variables in real-time as a function is executing.",
    usage: "local function test()\n    local a = 10\n    print(\"Initial a: \", a)\n    setstack(1, 1, 999) -- Change 'a' to 999\n    print(\"Modified a: \", a)\nend\ntest()",
    parameters: "- **Level (number)**: The target stack level.\n- **Index (number)**: The specific stack index to modify.\n- **Value (any)**: The new value to inject into the stack.",
    returns: "- **void**: This function does not return a value.",
    notes: "Use with extreme caution. Modifying the stack incorrectly will almost certainly lead to an immediate crash or severe game instability. Aliased as `debug.setstack()`."
  },
  "get_loaded_modules": {
    description: "[A] [PS] A legacy alias for `getloadedmodules`. It returns an array of all `ModuleScript` instances that have been loaded (via `require()`) and are currently cached in the game engine's memory. This is a primary way to find active game systems and their internal states.",
    usage: "local modules = get_loaded_modules()\nprint(\"Total loaded modules: \", #modules)\n\nfor _, m in pairs(modules) do\n    if m.Name == \"NetworkHandler\" then\n        print(\"Found active network module: \", m:GetFullName())\n        -- You can now use getmenv(m) to inspect its state\n    end\nend",
    returns: "- **Table**: A list of all currently loaded and cached `ModuleScript` objects.",
    notes: "Essential for identifying which parts of the game's logic are currently active and for finding targets for module hooking. Aliased as `getloadedmodules()`."
  },
  "unlockmodulescript": {
    description: "[A] [PS] A legacy alias for `unlockmodulescript`. It 'unlocks' a `ModuleScript` instance, which typically involves bypassing Roblox's internal security protections that prevent certain modules from being required or inspected by external scripts. This allows you to access and potentially modify the internal state of protected game modules.",
    usage: "local protectedModule = game.ReplicatedStorage.Core.NetworkHandler\nunlockmodulescript(protectedModule)\nlocal networkData = require(protectedModule)\nprint(\"Successfully required protected module data: \", networkData)",
    parameters: "- **ModuleScript (Instance)**: The target ModuleScript object you wish to unlock.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [A] (Alias) and [PS] (ProtoSmasher). This is a critical tool for interacting with core game systems that are normally hidden from user scripts. Aliased as `unlockmodulescript()`."
  },
  "getupvalue": {
    description: "Retrieves the value of a specific 'upvalue' from a Lua function or from a function at a specified stack level. Upvalues are variables defined in an outer scope that are 'captured' and used within a nested function (a closure). This is a fundamental tool for inspecting and modifying the state of game scripts.",
    usage: "local function createCounter()\n    local count = 0\n    return function()\n        count = count + 1\n        return count\n    end\nend\n\nlocal myCounter = createCounter()\nlocal currentCount = getupvalue(myCounter, 1)\nprint(\"Current internal count: \", currentCount) -- Output: 0",
    parameters: "- **Func/Stack (function/number)**: The target function to inspect, or a stack level (number) to target a running function.\n- **Index (number)**: The specific index of the upvalue you wish to retrieve.",
    returns: "- **Variant**: The value of the upvalue at the specified index.",
    notes: "Upvalues are the primary way that closures maintain their state between calls. Aliased as `debug.getupvalue()`."
  },
  "printconsole": {
    description: "[NR] Outputs a text message directly to the internal executor's console window. This is entirely separate from the standard Roblox developer console (`F9`) and is used for logging debug information that should not be visible to the game engine or other scripts.",
    usage: "printconsole(\"--- Opiumware Internal Debug Log ---\")\nprintconsole(\"Local Player: \" .. game.Players.LocalPlayer.Name)\nprintconsole(\"Current Time: \" .. os.date())\nprintconsole(\"------------------------------------\")",
    parameters: "- **Message (string)**: The text content to be displayed in the executor's console.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [NR] (Not Recommended/No Replicate). Messages sent here are completely invisible to the game's logs and anti-cheat systems. Aliased as `rconsoleprint()`."
  },
  "htgetf": {
    description: "[A] A legacy alias for `game:HttpGet()`. It performs a standard HTTP GET request to the specified URL and returns the entire response body as a raw string. This is a quick and easy way to fetch external data, such as script updates, configurations, or API responses.",
    usage: "local zenQuote = htgetf(\"https://api.github.com/zen\")\nprint(\"GitHub Zen: \", zenQuote)",
    parameters: "- **Url (string)**: The full, absolute URL of the resource you wish to fetch.",
    returns: "- **String**: The raw response body returned by the server.",
    notes: "Commonly used for downloading and executing external scripts (e.g., `loadstring(htgetf(\"url\"))()`). Aliased as `game:HttpGet()`."
  },
  "is_lclosure": {
    description: "Determines whether the specified function is a 'Lua Closure' (LClosure). A Lua closure is a function that was written in Lua code and compiled into bytecode. This is in contrast to 'C Closures' (CFunctions), which are implemented in C or C++ and provided by the Roblox engine or the executor itself.",
    usage: "local function myLuaFunc() end\nprint(\"Is Lua Function: \", is_lclosure(myLuaFunc)) -- Output: true\nprint(\"Is C Function: \", is_lclosure(print)) -- Output: false (print is a CFunction)",
    parameters: "- **Func (function)**: The function object you wish to inspect.",
    returns: "- **Boolean**: `true` if the function is a Lua closure, `false` otherwise.",
    notes: "This is a fundamental tool for script analysis, allowing you to distinguish between user-defined logic and built-in engine functionality. Aliased as `islclosure()`."
  },
  "getstateenv": {
    description: "Returns the global environment table (`_G` or `getfenv(0)`) of a specific Lua state (thread). This allows you to inspect or modify the global variables of a different execution context, which is vital for cross-thread communication and monitoring.",
    usage: "local targetThread = getstates()[1]\nlocal env = getstateenv(targetThread)\nif env then\n    print(\"Target state global 'Config': \", env.Config)\n    -- You can even modify the environment\n    env.Config = \"Modified\"\nend",
    parameters: "- **State (LuaState)**: The Lua state/thread whose environment you wish to retrieve.",
    returns: "- **Table**: The global environment table of the target state.",
    notes: "Use with caution when modifying environments of other threads, as it can lead to race conditions or crashes. Aliased as `get_state_env()`."
  },
  "getcallstack": {
    description: "Returns a detailed table representing the current Lua call stack. This includes information about every function currently being executed, their source files, line numbers, and names. This is an invaluable tool for debugging complex scripts and understanding the flow of execution.",
    usage: "local function a()\n    local function b()\n        local stack = getcallstack()\n        for i, info in ipairs(stack) do\n            print(\"Level \" .. i .. \": \", info.name, info.source, info.currentline)\n        end\n    end\n    b()\nend\na()",
    returns: "- **Table**: An array of tables, each containing info about a stack frame (`name`, `source`, `currentline`, `what`, etc.).",
    notes: "Invaluable for debugging complex scripts and understanding the flow of execution. Aliased as `get_call_stack()`."
  },
  "getinfo": {
    description: "[A] A legacy alias for `debug.getinfo`. It returns a table containing various pieces of information about a function, such as its name, source file, line numbers, and the number of parameters it accepts. This is the standard way to perform reflection on function properties in Lua.",
    usage: "local info = getinfo(print)\nprint(\"Function Name: \", info.name)\nprint(\"Source: \", info.source)\nprint(\"Num Params: \", info.numparams)",
    parameters: "- **Func (function/number)**: The function to inspect or a stack level.",
    returns: "- **Table**: A table containing function metadata.",
    notes: "Marked as [A] (Alias). This is the standard way to reflect on function properties in Lua. Aliased as `debug.getinfo()`."
  },
  "is_protosmasher_closure": {
    description: "[A] [PS] Checks if a given function (closure) was created within an exploit environment (like Opiumware or ProtoSmasher). This is used to distinguish between executor-defined functions and those defined by the game.",
    usage: "if is_protosmasher_closure(getgc) then\n    print(\"getgc is an exploit-defined function.\")\nend",
    parameters: "- **Func (function)**: The function to check.",
    returns: "- **Boolean**: `true` if the closure is from an exploit, `false` otherwise.",
    notes: "Similar to `is_synapse_function` but uses ProtoSmasher-compatible naming. Aliased as `is_synapse_function()`."
  },
  "getpointerfromstate": {
    description: "[?] [B] Retrieves a raw memory pointer from a specified Lua state. This is an extremely low-level function primarily used for debugging the executor's internal memory management.",
    usage: "local ptr = getpointerfromstate(myThread)\nprint(\"State Pointer: \", ptr)",
    parameters: "- **State (LuaState)**: The Lua state/thread to inspect.",
    returns: "- **Pointer**: A userdata or number representing the memory address.",
    notes: "Marked as [?] (Unknown) and [B] (Broken/Crashy). Use with extreme caution as passing an invalid state will likely cause an immediate crash. Aliased as `get_pointer_from_state()`."
  },
  "getpropvalue": {
    description: "Retrieves the value of a property from a Roblox Instance directly, bypassing all Lua-side metamethods (like `__index`). This ensures you get the 'real' value from the engine, even if the property has been hooked or spoofed by another script.",
    usage: "local part = game.Workspace.Part\nlocal realName = getpropvalue(part, \"Name\")\nprint(\"Actual Engine Name: \", realName)",
    parameters: "- **Instance (Instance)**: The Roblox object to inspect.\n- **Property (string)**: The name of the property to retrieve.",
    returns: "- **Variant**: The raw property value from the engine.",
    notes: "Essential for bypassing anti-cheats that attempt to hide or spoof property values. Aliased as `get_prop_value()`."
  },
  "getupvalues": {
    description: "[A] A legacy alias for `debug.getupvalues`. It returns a table containing all the upvalues (captured variables) associated with a specific Lua function. This is a fundamental tool for inspecting and modifying the state of game scripts.",
    usage: "local function outer()\n    local secret = \"Opium\"\n    return function()\n        print(secret)\n    end\nend\n\nlocal inner = outer()\nlocal upvalues = getupvalues(inner)\nfor i, val in pairs(upvalues) do\n    print(\"Upvalue \" .. i .. \": \", val)\nend",
    parameters: "- **Func (function)**: The target function to inspect.",
    returns: "- **Table**: A dictionary-like table where keys are upvalue indices and values are the corresponding upvalue entries.",
    notes: "Marked as [A] (Alias). This is the standard way to perform reflection on function properties in Lua. Aliased as `debug.getupvalues()`."
  },
  "rconsoleclear": {
    description: "Clears all text and output from the internal executor console window. This is useful for keeping your debug logs clean and readable during long-running scripts.",
    usage: "printconsole(\"Starting process...\")\nwait(5)\nrconsoleclear()\nprintconsole(\"Process complete. Console cleared.\")",
    returns: "- **void**: This function does not return a value.",
    notes: "Only affects the internal executor console, not the Roblox developer console. Aliased as `rconsole_clear()`."
  },
  "getlocals": {
    description: "[A] [B] A legacy alias for `debug.getlocals`. It returns a table containing all the local variables that are currently defined at a specific stack level (i.e., within a running function). This is a powerful tool for inspecting the internal state of game scripts.",
    usage: "local function test()\n    local myVar = \"Secret\"\n    local locals = getlocals(1)\n    print(\"Local 'myVar': \", locals.myVar)\nend\ntest()",
    parameters: "- **Level (number)**: The stack level to inspect (1 is the current function).",
    returns: "- **Table**: A dictionary-like table of local variable names and their values.",
    notes: "Marked as [A] (Alias) and [B] (Broken/Crashy). Accessing locals at high stack levels can be unstable. Aliased as `debug.getlocals()`."
  },
  "is_redirection_enabled": {
    description: "[?] Checks if the executor's environment redirection system is currently active. Redirection is used to intercept calls to standard functions and route them through custom handlers.",
    usage: "if is_redirection_enabled() then\n    print(\"Environment redirection is active.\")\nend",
    returns: "- **Boolean**: `true` if redirection is enabled, `false` otherwise.",
    notes: "Marked as [?] (Unknown). This is an internal state check for advanced users. Aliased as `is_redirection_active()`."
  },
  "setpropvalue": {
    description: "Sets the value of a property on a Roblox Instance directly, bypassing all Lua-side metamethods (like `__newindex`). This allows you to modify properties even if they are protected or hooked by the game's anti-cheat.",
    usage: "local part = game.Workspace.Part\nsetpropvalue(part, \"Transparency\", 0.5)\nprint(\"Transparency set directly via engine.\")",
    parameters: "- **Instance (Instance)**: The Roblox object to modify.\n- **Property (string)**: The name of the property to change.\n- **Value (Variant)**: The new value to set for the property.",
    returns: "- **void**: This function does not return a value.",
    notes: "A powerful tool for bypassing client-side property restrictions. Aliased as `set_prop_value()`."
  },
  "setlocal": {
    description: "[A] [B] A legacy alias for `debug.setlocal`. It allows you to directly modify the value of a local variable at a specific stack level and index. This can be used to change the state of a running function from the outside.",
    usage: "local function test()\n    local a = 10\n    spawn(function()\n        wait(1)\n        setlocal(2, 1, 99) -- Modify 'a' in the 'test' function\n    end)\n    wait(2)\n    print(\"Value of a: \", a) -- Output: 99\nend\ntest()",
    parameters: "- **Level (number)**: The stack level to target.\n- **Index (number)**: The index of the local variable to modify.\n- **Value (Variant)**: The new value to assign to the local variable.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [A] (Alias) and [B] (Broken/Crashy). Use with extreme caution as incorrect indices will cause crashes. Aliased as `debug.setlocal()`."
  },
  "make_writeable": {
    description: "[A] [PS] A legacy alias for `setreadonly(table, false)`. It removes the read-only protection from a Lua table, allowing you to modify its fields. This is commonly used to unlock metatables for hooking.",
    usage: "local mt = getrawmetatable(game)\nmake_writeable(mt)\nmt.__namecall = function(...) -- Now we can hook it\n    -- ...\nend",
    parameters: "- **Table (table)**: The table to unlock.",
    returns: "- **void**: This function does not return a value.",
    notes: "Marked as [A] (Alias) and [PS] (ProtoSmasher). Essential for advanced script manipulation. Aliased as `setreadonly(table, false)`."
  },
  "_VERSION": {
    description: "A global string variable that contains the current version of the Lua language being used by the executor. In Opiumware, this typically reflects the version of Luau or Lua 5.1 that the environment is based on.",
    usage: "print(\"Current Lua Version: \", _VERSION)\nif _VERSION:find(\"Luau\") then\n    print(\"Using Luau optimizations.\")\nend",
    returns: "- **String**: The Lua version identifier (e.g., \"Lua 5.1\", \"Luau\").",
    notes: "This is a standard Lua global, but its value is specific to the executor's implementation. Aliased as `_VERSION`."
  },
  "syn.crypto.encrypt": {
    description: "Encrypts a string using the specified key and algorithm (defaulting to AES-CBC). This is used for protecting sensitive data or communicating with external servers securely.",
    usage: "local data = \"Hello World\"\nlocal key = \"my-secret-key-123\"\nlocal encrypted = syn.crypto.encrypt(data, key)\nprint(\"Encrypted: \", encrypted)",
    parameters: "- **Data (string)**: The plaintext string to encrypt.\n- **Key (string)**: The encryption key (must be of appropriate length for the algorithm).",
    returns: "- **String**: The base64-encoded encrypted data.",
    notes: "Ensure your key length matches the requirements of the encryption algorithm used. Aliased as `syn.crypto.encrypt()`."
  },
  "syn.crypto.decrypt": {
    description: "Decrypts a base64-encoded encrypted string using the specified key and algorithm. This allows you to retrieve the original plaintext data.",
    usage: "local encrypted = \"...\"\nlocal key = \"my-secret-key-123\"\nlocal decrypted = syn.crypto.decrypt(encrypted, key)\nprint(\"Decrypted: \", decrypted)",
    parameters: "- **Data (string)**: The base64-encoded encrypted string.\n- **Key (string)**: The decryption key used during encryption.",
    returns: "- **String**: The original plaintext data.",
    notes: "The key and algorithm must exactly match those used for encryption. Aliased as `syn.crypto.decrypt()`."
  },
  "syn.crypto.derive": {
    description: "Derives a cryptographic key from a base string (like a password) and a specified length using a key derivation function (KDF). This is more secure than using a raw password as a key.",
    usage: "local password = \"user-password\"\nlocal salt = \"random-salt\"\nlocal key = syn.crypto.derive(password, 32)\nprint(\"Derived Key: \", key)",
    parameters: "- **String (string)**: The base string/password.\n- **Length (number)**: The desired length of the output key in bytes.",
    returns: "- **String**: The derived cryptographic key.",
    notes: "Useful for generating consistent keys from user input. Aliased as `syn.crypto.derive()`."
  },
  "syn.crypto.random": {
    description: "Generates a cryptographically secure random string of the specified length. This is ideal for creating salts, nonces, or temporary identifiers.",
    usage: "local nonce = syn.crypto.random(16)\nprint(\"Random Nonce: \", nonce)",
    parameters: "- **Length (number)**: The number of random bytes to generate.",
    returns: "- **String**: A string containing the generated random bytes.",
    notes: "Uses the system's secure random number generator. Aliased as `syn.crypto.random()`."
  },
  "syn.crypto.hash": {
    description: "Generates a cryptographic hash (e.g., SHA-256) of the specified string. Hashing is a one-way process used to verify data integrity or store passwords securely.",
    usage: "local data = \"important-data\"\nlocal hash = syn.crypto.hash(data, \"sha256\")\nprint(\"SHA-256 Hash: \", hash)",
    parameters: "- **Data (string)**: The string to hash.\n- **Algorithm (string, optional)**: The hashing algorithm to use (default is \"sha256\").",
    returns: "- **String**: The hex-encoded hash of the input data.",
    notes: "Commonly used for checksums and data verification. Aliased as `syn.crypto.hash()`."
  },
  "syn.request": {
    description: "[A] A powerful alias for `http_request` or `game.HttpPost`. It performs a full HTTP request with support for custom headers, methods, and body data. This is the standard way to interact with external APIs.",
    usage: "local response = syn.request({\n    Url = \"https://httpbin.org/post\",\n    Method = \"POST\",\n    Headers = {\n        [\"Content-Type\"] = \"application/json\"\n    },\n    Body = game:GetService(\"HttpService\"):JSONEncode({hello = \"world\"})\n})\nprint(\"Status: \", response.StatusCode)\nprint(\"Body: \", response.Body)",
    parameters: "- **Options (table)**: A table containing `Url`, `Method`, `Headers`, `Body`, etc.",
    returns: "- **Table**: A response table containing `Success`, `StatusCode`, `StatusMessage`, `Headers`, and `Body`.",
    notes: "Marked as [A] (Alias). This is the most versatile HTTP function in the executor. Aliased as `http_request()`."
  },
  "debug.getstack": {
    description: "Returns a table representing the Lua stack at a specific level. This allows you to inspect all values currently being processed by a function, including temporary variables and expression results.",
    usage: "local function test(a, b)\n    local c = a + b\n    local stack = debug.getstack(1)\n    for i, v in pairs(stack) do\n        print(\"Stack [\" .. i .. \"]: \", v)\n    end\nend\ntest(10, 20)",
    parameters: "- **Level (number)**: The stack level to inspect (1 is current).",
    returns: "- **Table**: An array-like table containing all values on the stack at that level.",
    notes: "A deep-level debugging tool for understanding complex function logic. Aliased as `getstack()`."
  },
  "debug.setstack": {
    description: "Directly modifies a value in the Lua stack at a specific level and index. This is an extremely powerful and dangerous function that can change the behavior of running code in real-time.",
    usage: "local function test()\n    local x = 10\n    debug.setstack(1, 1, 99) -- Change the first value on the stack\n    print(\"X is now: \", x) -- Might output 99 depending on compiler optimizations\nend\ntest()",
    parameters: "- **Level (number)**: The stack level to target.\n- **Index (number)**: The index on the stack to modify.\n- **Value (Variant)**: The new value to push onto the stack.",
    returns: "- **void**: This function does not return a value.",
    notes: "Use with extreme caution. Modifying the stack incorrectly will lead to immediate crashes. Aliased as `setstack()`."
  },
  "Drawing.new": {
    description: "Creates a new drawing object of the specified class (e.g., 'Line', 'Circle', 'Text', 'Square', 'Image'). These objects are rendered directly on the screen, bypassing the Roblox UI system, making them invisible to the game's UI-based anti-cheats.",
    usage: "local line = Drawing.new(\"Line\")\nline.Visible = true\nline.From = Vector2.new(100, 100)\nline.To = Vector2.new(200, 200)\nline.Color = Color3.new(1, 0, 0)\nline.Thickness = 2",
    parameters: "- **ClassName (string)**: The type of drawing object to create (e.g., \"Line\", \"Text\", \"Circle\", \"Square\", \"Image\").",
    returns: "- **DrawingObject**: The newly created drawing object with default properties.",
    notes: "Drawing objects must have their `Visible` property set to `true` to be seen. Aliased as `Drawing.new()`."
  },
  "game.HttpGet": {
    description: "Performs a synchronous HTTP GET request to the specified URL and returns the response body as a string. This is commonly used for fetching scripts, configurations, or data from external web servers.",
    usage: "local scriptContent = game:HttpGet(\"https://raw.githubusercontent.com/user/repo/main/script.lua\")\nloadstring(scriptContent)()",
    parameters: "- **Url (string)**: The full URL to fetch data from.\n- **Cache (boolean, optional)**: Whether to use the internal cache (default is `true`).",
    returns: "- **String**: The raw response body from the server.",
    notes: "This function blocks the current thread until the request completes. Aliased as `HttpGet()`."
  },
  "game.HttpPost": {
    description: "[B] [NR] Performs a synchronous HTTP POST request to the specified URL with the provided data. This is used for sending data to external servers, though `syn.request` is generally preferred for its better error handling and flexibility.",
    usage: "local response = game:HttpPost(\"https://api.example.com/log\", \"user=opium&action=login\")\nprint(\"Server Response: \", response)",
    parameters: "- **Url (string)**: The destination URL.\n- **Data (string)**: The body data to send in the POST request.\n- **ContentType (string, optional)**: The MIME type of the data (default is \"application/x-www-form-urlencoded\").",
    returns: "- **String**: The response body from the server.",
    notes: "Marked as [B] (Broken/Crashy) and [NR] (Not Recommended). Use `syn.request` instead for more reliable networking. Aliased as `HttpPost()`."
  },
  "setupvalue": {
    description: "[A] A legacy alias for `setupval`. It allows you to modify the value of an upvalue within a Lua function, effectively altering its internal state and behavior.",
    usage: "setupvalue(someFunction, 1, \"New Value\")",
    parameters: "- **Func (function)**: The target function.\n- **Index (number)**: The upvalue index.\n- **Value (any)**: The new value to set.",
    returns: "- **void**",
    notes: "Aliased as `setupval()`."
  },
  "LuaStateProxy.Event": {
    description: "A property of `LuaStateProxy` that provides access to an event fired when certain actions occur within the isolated Lua state.",
    usage: "proxy.Event:Connect(function(data) print(\"Event fired: \", data) end)",
    returns: "- **RBXScriptSignal**: The event signal.",
    notes: "Useful for monitoring the status of isolated scripts."
  },
  "LuaStateProxy.Id": {
    description: "A unique identifier for the `LuaStateProxy` instance, used to distinguish between different isolated states.",
    usage: "print(\"Proxy ID: \", proxy.Id)",
    returns: "- **String**: The unique ID of the proxy.",
    notes: "Mainly used for internal tracking and debugging."
  },
  "LuaStateProxy.IsActorState": {
    description: "A boolean property indicating whether the `LuaStateProxy` is currently managing a state that is tied to a Roblox `Actor` for parallel execution.",
    usage: "if proxy.IsActorState then print(\"Running in parallel!\") end",
    returns: "- **Boolean**: True if it's an actor state.",
    notes: "Helps determine the execution context of the proxy."
  },
  "syn.crypto.custom.decrypt": {
    description: "Decrypts data using a custom, user-defined algorithm and key. This is for advanced users who need to implement specific encryption schemes not natively supported by the executor.",
    usage: "local decrypted = syn.crypto.custom.decrypt(\"my-custom-algo\", encryptedData, \"my-key\")",
    parameters: "- **Algorithm (string)**: The name of the custom algorithm to use.\n- **Data (string)**: The encrypted data to decrypt.\n- **Key (string)**: The decryption key.",
    returns: "- **String**: The decrypted plaintext data.",
    notes: "The algorithm must be one that the executor's custom crypto engine recognizes. Aliased as `syn.crypto.custom.decrypt()`."
  },
  "syn.crypto.custom.encrypt": {
    description: "Encrypts data using a custom, user-defined algorithm and key. This allows for the implementation of proprietary or specialized encryption methods within your scripts.",
    usage: "local encrypted = syn.crypto.custom.encrypt(\"my-custom-algo\", \"secret-data\", \"my-key\")",
    parameters: "- **Algorithm (string)**: The name of the custom algorithm to use.\n- **Data (string)**: The plaintext data to encrypt.\n- **Key (string)**: The encryption key.",
    returns: "- **String**: The encrypted data string.",
    notes: "Ensure the algorithm name is correct and supported by the environment. Aliased as `syn.crypto.custom.encrypt()`."
  },
  "syn.crypto.custom.hash": {
    description: "Generates a cryptographic hash of the specified data using a custom algorithm. This is useful for specialized data integrity checks.",
    usage: "local hash = syn.crypto.custom.hash(\"my-custom-hash-algo\", \"data-to-hash\")",
    parameters: "- **Algorithm (string)**: The name of the custom hashing algorithm.\n- **Data (string)**: The data to hash.",
    returns: "- **String**: The resulting hash string.",
    notes: "Useful for matching hashes generated by specific external systems. Aliased as `syn.crypto.custom.hash()`."
  },
  "syn.crypto.base64.encode": {
    description: "Encodes a raw string into its Base64 representation. Base64 is commonly used for encoding binary data into a text-safe format for transmission over HTTP or storage in JSON.",
    usage: "local encoded = syn.crypto.base64.encode(\"Opiumware\")\nprint(\"Base64: \", encoded) -- Output: T3BpdW13YXJl",
    parameters: "- **Data (string)**: The raw string or binary data to encode.",
    returns: "- **String**: The Base64 encoded string.",
    notes: "Standard Base64 encoding. Aliased as `base64_encode()`."
  },
  "syn.crypto.base64.decode": {
    description: "Decodes a Base64 encoded string back into its original raw format. This is the inverse of `syn.crypto.base64.encode`.",
    usage: "local decoded = syn.crypto.base64.decode(\"T3BpdW13YXJl\")\nprint(\"Decoded: \", decoded) -- Output: Opiumware",
    parameters: "- **Data (string)**: The Base64 encoded string to decode.",
    returns: "- **String**: The original raw data string.",
    notes: "Standard Base64 decoding. Aliased as `base64_decode()`."
  },
  "syn.crypt.random": {
    description: "[A] A legacy alias for `syn.crypto.random`. Generates a cryptographically secure random string of the specified length.",
    usage: "local nonce = syn.crypt.random(16)\nprint(\"Random Nonce: \", nonce)",
    parameters: "- **Length (number)**: The number of random bytes to generate.",
    returns: "- **String**: A string containing the generated random bytes.",
    notes: "Marked as [A] (Alias). Aliased as `syn.crypto.random()`."
  },
  "syn.crypt.derive": {
    description: "[A] A legacy alias for `syn.crypto.derive`. Derives a cryptographic key from a base string (like a password) and a specified length.",
    usage: "local key = syn.crypt.derive(\"password\", 32)\nprint(\"Derived Key: \", key)",
    parameters: "- **String (string)**: The base string/password.\n- **Length (number)**: The desired length of the output key in bytes.",
    returns: "- **String**: The derived cryptographic key.",
    notes: "Marked as [A] (Alias). Aliased as `syn.crypto.derive()`."
  },
  "syn.crypt.custom.decrypt": {
    description: "[A] A legacy alias for `syn.crypto.custom.decrypt`. Decrypts data using a custom, user-defined algorithm and key.",
    usage: "local decrypted = syn.crypt.custom.decrypt(\"my-custom-algo\", encryptedData, \"my-key\")",
    parameters: "- **Algorithm (string)**: The name of the custom algorithm to use.\n- **Data (string)**: The encrypted data to decrypt.\n- **Key (string)**: The decryption key.",
    returns: "- **String**: The decrypted plaintext data.",
    notes: "Marked as [A] (Alias). Aliased as `syn.crypto.custom.decrypt()`."
  },
  "syn.crypt.custom.encrypt": {
    description: "[A] A legacy alias for `syn.crypto.custom.encrypt`. Encrypts data using a custom, user-defined algorithm and key.",
    usage: "local encrypted = syn.crypt.custom.encrypt(\"my-custom-algo\", \"secret-data\", \"my-key\")",
    parameters: "- **Algorithm (string)**: The name of the custom algorithm to use.\n- **Data (string)**: The plaintext data to encrypt.\n- **Key (string)**: The encryption key.",
    returns: "- **String**: The encrypted data string.",
    notes: "Marked as [A] (Alias). Aliased as `syn.crypto.custom.encrypt()`."
  },
  "syn.crypt.custom.hash": {
    description: "[A] A legacy alias for `syn.crypto.custom.hash`. Generates a cryptographic hash of the specified data using a custom algorithm.",
    usage: "local hash = syn.crypt.custom.hash(\"my-custom-hash-algo\", \"data-to-hash\")",
    parameters: "- **Algorithm (string)**: The name of the custom hashing algorithm.\n- **Data (string)**: The data to hash.",
    returns: "- **String**: The resulting hash string.",
    notes: "Marked as [A] (Alias). Aliased as `syn.crypto.custom.hash()`."
  },
  "syn.run_secure_function": {
    description: "Executes a Lua function within a highly protected and isolated environment. This is used to run sensitive code that should be shielded from external inspection or modification by other scripts.",
    usage: "local function sensitiveCode()\n    print(\"Running in secure environment.\")\nend\nsyn.run_secure_function(sensitiveCode)",
    parameters: "- **Func (function)**: The function to execute securely.",
    returns: "- **Variant**: Returns whatever the target function returns.",
    notes: "Provides an extra layer of security for critical script logic. Aliased as `run_secure_function()`."
  },
  "syn.create_secure_function": {
    description: "Compiles a string of Lua code into a secure, protected function. This function will run in an isolated environment when called, protecting its internal logic from being hooked or inspected.",
    usage: "local securePrint = syn.create_secure_function(\"print('Securely printed!')\")\nsecurePrint()",
    parameters: "- **Code (string)**: The Lua source code to compile into a secure function.",
    returns: "- **Function**: A new Lua function that is protected by the executor's security system.",
    notes: "Useful for dynamically generating secure code. Aliased as `create_secure_function()`."
  },
  "syn.is_beta": {
    description: "Returns a boolean indicating whether the current version of the executor is a beta release. This can be used to enable or disable experimental features in your scripts.",
    usage: "if syn.is_beta() then\n    print(\"You are running the Opiumware Beta.\")\nend",
    returns: "- **Boolean**: `true` if the executor is a beta version, `false` otherwise.",
    notes: "Helpful for conditional logic based on the executor's release channel. Aliased as `is_beta()`."
  },
  "debug.setupvaluename": {
    description: "Sets the name of an upvalue in a function at a specific index. This is primarily used for debugging and reflection purposes.",
    usage: "local function test()\n    local secret = 1\n    print(secret)\nend\ndebug.setupvaluename(test, 1, \"newSecretName\")",
    parameters: "- **Func (function)**: The function containing the upvalue.\n- **Index (number)**: The index of the upvalue to rename.\n- **Name (string)**: The new name to assign to the upvalue.",
    returns: "- **void**: This function does not return a value.",
    notes: "Useful for clarifying the purpose of captured variables in decompiled or inspected code. Aliased as `setupvaluename()`."
  },
  "debug.getprotos": {
    description: "Returns a table containing all the 'proto' (prototype) functions defined within a given Lua function. Protos are the internal representations of nested functions.",
    usage: "local function parent()\n    local function child1() end\n    local function child2() end\nend\nlocal protos = debug.getprotos(parent)\nfor i, p in pairs(protos) do\n    print(\"Proto \" .. i .. \": \", p)\nend",
    parameters: "- **Func (function)**: The parent function to inspect.",
    returns: "- **Table**: An array-like table containing all nested proto functions.",
    notes: "Essential for deep reflection and understanding the structure of complex scripts. Aliased as `getprotos()`."
  },
  "debug.getproto": {
    description: "Retrieves a specific proto (prototype) function from a parent function at the given index.",
    usage: "local function parent()\n    local function child() print(\"I am a proto\") end\nend\nlocal childProto = debug.getproto(parent, 1)\nprint(\"Retrieved Proto: \", childProto)",
    parameters: "- **Func (function)**: The parent function.\n- **Index (number)**: The index of the proto to retrieve.\n- **Activated (boolean, optional)**: Whether to return an activated closure (default is `false`).",
    returns: "- **Function**: The requested proto function.",
    notes: "Allows for targeted inspection of nested function logic. Aliased as `getproto()`."
  },
  "debug.setproto": {
    description: "Replaces a proto (prototype) function within a parent function with a new function. This is an extremely advanced technique for modifying script behavior at a structural level.",
    usage: "local function parent()\n    local function child() print(\"Original\") end\n    child()\nend\ndebug.setproto(parent, 1, function() print(\"Hooked!\") end)\nparent() -- Might output \"Hooked!\" depending on how it's called",
    parameters: "- **Func (function)**: The parent function to modify.\n- **Index (number)**: The index of the proto to replace.\n- **NewProto (function)**: The new function to insert as a proto.",
    returns: "- **void**: This function does not return a value.",
    notes: "Use with extreme caution. Structural modification of functions is highly unstable. Aliased as `setproto()`."
  },
  "Drawing.Fonts": {
    description: "A table containing the available font identifiers for use with `Drawing.Text` objects. These fonts are rendered by the executor's drawing engine.",
    usage: "local text = Drawing.new(\"Text\")\ntext.Font = Drawing.Fonts.Monospace\ntext.Text = \"Opiumware Debug\"\ntext.Visible = true",
    returns: "- **Table**: A dictionary mapping font names (e.g., \"UI\", \"System\", \"Plex\", \"Monospace\") to their internal IDs.",
    notes: "Allows you to customize the appearance of on-screen text overlays. Aliased as `Drawing.Fonts`."
  },
  "game.HttpGetAsync": {
    description: "[A] A legacy alias for `game.HttpGet`. It performs a synchronous HTTP GET request to the specified URL.",
    usage: "local body = game:HttpGetAsync(\"https://api.example.com/data\")\nprint(\"Data: \", body)",
    parameters: "- **Url (string)**: The URL to fetch.",
    returns: "- **String**: The response body.",
    notes: "Marked as [A] (Alias). Despite the 'Async' name, this function is typically synchronous in most executors. Aliased as `HttpGet()`."
  },
  "game.HttpPostAsync": {
    description: "[A] A legacy alias for `game.HttpPost`. It performs a synchronous HTTP POST request to the specified URL.",
    usage: "game:HttpPostAsync(\"https://api.example.com/submit\", \"key=value\")",
    parameters: "- **Url (string)**: The destination URL.\n- **Data (string)**: The body data to send.",
    returns: "- **String**: The response body.",
    notes: "Marked as [A] (Alias). Typically synchronous despite the name. Aliased as `HttpPost()`."
  },
  "get_module_env": {
    description: "[A] An alias for `getmenv`. It retrieves the global environment of a `ModuleScript`.",
    usage: "local env = get_module_env(module)",
    parameters: "- **Module (Instance)**: The ModuleScript.",
    returns: "- **Table**: The environment table.",
    notes: "Aliased as `getmenv()`."
  },
  "get_thread_context": {
    description: "[A] An alias for `getthreadidentity`. It returns the current thread's identity level.",
    usage: "local identity = get_thread_context()",
    returns: "- **Number**: The identity level.",
    notes: "Aliased as `getthreadidentity()`."
  },
  "set_thread_context": {
    description: "[A] An alias for `setthreadidentity`. It sets the current thread's identity level.",
    usage: "set_thread_context(7)",
    parameters: "- **Identity (Number)**: The identity level.",
    returns: "- **void**",
    notes: "Aliased as `setthreadidentity()`."
  },
  "get_properties": {
    description: "[A] An alias for `getproperties`. It returns all properties of an Instance.",
    usage: "local props = get_properties(instance)",
    parameters: "- **Object (Instance)**: The target instance.",
    returns: "- **Table**: A dictionary of properties.",
    notes: "Aliased as `getproperties()`."
  },
  "get_hidden_properties": {
    description: "[A] An alias for `gethiddenproperties`. It returns only the hidden properties of an Instance.",
    usage: "local hiddenProps = get_hidden_properties(instance)",
    parameters: "- **Object (Instance)**: The target instance.",
    returns: "- **Table**: A dictionary of hidden properties.",
    notes: "Aliased as `gethiddenproperties()`."
  },
  "get_raw_metatable": {
    description: "[A] An alias for `getrawmetatable`. It returns the raw metatable of an object.",
    usage: "local mt = get_raw_metatable(game)",
    parameters: "- **Object (any)**: The target object.",
    returns: "- **Table**: The raw metatable.",
    notes: "Aliased as `getrawmetatable()`."
  },
  "set_raw_metatable": {
    description: "[A] An alias for `setrawmetatable`. It sets the raw metatable of an object.",
    usage: "set_raw_metatable(obj, mt)",
    parameters: "- **Object (any)**: The target object.\n- **Metatable (Table)**: The new metatable.",
    returns: "- **void**",
    notes: "Aliased as `setrawmetatable()`."
  },
  "set_readonly": {
    description: "[A] An alias for `make_readonly`. It sets the read-only state of a table.",
    usage: "set_readonly(mt, false)",
    parameters: "- **Table (Table)**: The target table.\n- **ReadOnly (Boolean)**: The new state.",
    returns: "- **void**",
    notes: "Aliased as `make_readonly()` and `makereadonly()`."
  },
  "rconsole_clear": {
    description: "[A] An alias for `rconsoleclear`. It clears the external console window.",
    usage: "rconsole_clear()",
    returns: "- **void**",
    notes: "Aliased as `rconsoleclear()`."
  },
  "debug.getconstants": {
    description: "[A] An alias for `getconstants`. It returns a table of constants from a function.",
    usage: "local constants = debug.getconstants(func)",
    parameters: "- **Func (function)**: The target function.",
    returns: "- **Table**: A list of constants.",
    notes: "Aliased as `getconstants()`."
  },
  "debug.getupvalues": {
    description: "[A] An alias for `getupvalues`. It returns a table of upvalues from a function.",
    usage: "local upvalues = debug.getupvalues(func)",
    parameters: "- **Func (function)**: The target function.",
    returns: "- **Table**: A list of upvalues.",
    notes: "Aliased as `getupvalues()`."
  },
  "debug.getlocals": {
    description: "[A] An alias for `getlocals`. It returns a table of local variables at a stack level.",
    usage: "local locals = debug.getlocals(1)",
    parameters: "- **Level (number)**: The stack level.",
    returns: "- **Table**: A dictionary of locals.",
    notes: "Aliased as `getlocals()`."
  },
  "debug.setlocal": {
    description: "[A] An alias for `setlocal`. It sets a local variable at a stack level.",
    usage: "debug.setlocal(1, \"var\", \"val\")",
    parameters: "- **Level (number)**: The stack level.\n- **Name (string)**: The variable name.\n- **Value (any)**: The new value.",
    returns: "- **void**",
    notes: "Aliased as `setlocal()`."
  },
  "is_redirection_active": {
    description: "[A] An alias for `is_redirection_enabled`. It checks if environment redirection is active.",
    usage: "if is_redirection_active() then end",
    returns: "- **Boolean**: True if active.",
    notes: "Aliased as `is_redirection_enabled()`."
  },
  "get_namecall_method": {
    description: "[A] An alias for `getnamecallmethod`. It returns the method name during a __namecall hook.",
    usage: "local method = get_namecall_method()",
    returns: "- **String**: The method name.",
    notes: "Aliased as `getnamecallmethod()`."
  },
  "set_namecall_method": {
    description: "[A] An alias for `setnamecallmethod`. It spoofs the method name during a __namecall hook.",
    usage: "set_namecall_method(\"print\")",
    parameters: "- **Method (string)**: The new method name.",
    returns: "- **void**",
    notes: "Aliased as `setnamecallmethod()`."
  },
  "get_all_states": {
    description: "[A] An alias for `getstates`. It returns all active global Lua states.",
    usage: "local states = get_all_states()",
    returns: "- **Table**: A list of Lua states.",
    notes: "Aliased as `getstates()`."
  },
  "get_instance_from_state": {
    description: "[A] An alias for `getinstancefromstate`. It retrieves the script instance associated with a state.",
    usage: "local script = get_instance_from_state(thread)",
    parameters: "- **Thread (thread)**: The target state.",
    returns: "- **Instance**: The associated script.",
    notes: "Aliased as `getinstancefromstate()`."
  },
  "is_game_focused": {
    description: "[A] An alias for `validfgwindow`. It checks if the game window is currently focused.",
    usage: "if is_game_focused() then end",
    returns: "- **Boolean**: True if focused.",
    notes: "Aliased as `validfgwindow()`."
  },
  "get_state_env": {
    description: "[A] An alias for `getstateenv`. It returns the global environment of a specific state.",
    usage: "local env = get_state_env(thread)",
    parameters: "- **State (LuaState)**: The target state.",
    returns: "- **Table**: The environment table.",
    notes: "Aliased as `getstateenv()`."
  },
  "get_call_stack": {
    description: "[A] An alias for `getcallstack`. It returns the current Lua call stack.",
    usage: "local stack = get_call_stack()",
    returns: "- **Table**: A list of stack frames.",
    notes: "Aliased as `getcallstack()`."
  },
  "is_opiumware_function": {
    description: "[A] An alias for `is_synapse_function`. It checks if a function is a built-in executor function.",
    usage: "if is_opiumware_function(getgc) then end",
    parameters: "- **Func (function)**: The function to check.",
    returns: "- **Boolean**: True if it's an executor function.",
    notes: "Aliased as `is_synapse_function()`."
  },
  "replace_closure": {
    description: "[A] An alias for `replaceclosure`. It forcefully replaces a function's implementation.",
    usage: "replace_closure(print, myPrint)",
    parameters: "- **FuncA (function)**: The target function.\n- **FuncB (function)**: The new implementation.",
    returns: "- **void**",
    notes: "Aliased as `replaceclosure()`."
  },
  "rconsoleprint": {
    description: "[A] An alias for `printconsole`. It outputs text to the internal executor console.",
    usage: "rconsoleprint(\"Hello!\")",
    parameters: "- **Message (string)**: The text to print.",
    returns: "- **void**",
    notes: "Aliased as `printconsole()`."
  },
};

export const docs: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    category: "General",
    content: `
# 🚀 Welcome to Opiumware Documentation

Opiumware is a high-performance, feature-rich Lua executor designed for power users and developers. This documentation provides a comprehensive guide to the custom functions and libraries available in the Opiumware environment.

## 🌟 Getting Started

Opiumware provides a wide range of functions categorized for easy access. Use the sidebar to navigate through the different libraries and functions. Each entry includes a detailed description, parameter list, return values, and practical examples.

<div class="callout">
  <span class="text-accent">ℹ️</span>
  <span>This documentation is subject to updates as the environment evolves. Stay tuned for the latest features and improvements.</span>
</div>

## 🏷️ Legend

To help you understand the status and behavior of various functions, we use the following symbols and notations:

### Symbols
| Symbol | Meaning |
| :--- | :--- |
| **[NH]** | **No Hook**: This function cannot be hooked using \`hookfunction\` or similar methods. |
| **[B]** | **Beta**: This feature is experimental and may be unstable or subject to change. |
| **[A]** | **Alias**: This is an alternative name for another function (e.g., \`get_nil_instances\` is an alias for \`getnilinstances\`). |
| **[PS]** | **ProtoSmasher**: This function is part of the ProtoSmasher-compatible API. |
| **[SH]** | **SirHurt**: This function is part of the SirHurt-compatible API. |
| **[NR]** | **No Replicate**: Changes made by this function do not replicate to the server. |
| **[?]** | **Unknown/Unstable**: The behavior of this function is not fully documented or may cause crashes. |

### Extra Info
| Notation | Meaning |
| :--- | :--- |
| **\<void\>** | The function does not return any value. |
| **???** | Parameters or behavior are currently unknown or unverified. |
| **\<...\>** | The function accepts a variable number of arguments (variadic). |
| **\<o\>** | Indicates an optional parameter. |

---
*Documentation version: 1.0.5*
    `
  },
  ...uniqueFunctions.map(f => {
    const specific = specificDocs[f] || specificDocs[f.toLowerCase()];
    return {
      id: f.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: f,
      category: getCategory(f),
      content: `
# ${f}

${specific ? specific.description : `Documentation for the \`${f}\` function.`}

### Description
${specific ? specific.description : `This function is part of Opiumware. It provides specialized functionality for interacting with the environment.`}

### Usage
\`\`\`lua
-- Example usage of ${f}
${specific ? specific.usage : `local result = ${f}()\nprint(result)`}
\`\`\`

### Parameters
${specific?.parameters || "- **None**: This function typically does not require parameters, or parameters vary by implementation."}

### Returns
${specific?.returns || "- **Variant**: Returns data based on the specific operation performed."}

${specific?.notes ? `### Notes\n${specific.notes}` : ""}
      `
    };
  })
];
