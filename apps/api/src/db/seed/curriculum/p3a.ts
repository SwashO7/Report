import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'python-basics',
    title: 'Python Basics',
    description:
      'Enough Python to read a script someone hands you and write small tools of your own - not to become a software engineer. By the end you can follow variables, lists, dicts and loops through a program, split logic into functions, open and read files, and understand an error message instead of panicking at it. Every example is security-flavoured.',
    lessons: [
      {
        slug: 'why-python',
        title: 'Why Python Is the Hacker\'s Language',
        summary: 'Almost every hacking tool is written in Python. Here is why, and why a little of it goes a long way.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Open any hacker\'s toolbox and half the tools inside are Python. sqlmap, a huge chunk of the exploit scripts on the internet, the quick "just automate this one thing" snippets people paste in Discord - Python. You do not need to become a programmer. You need enough Python to read what a tool is doing and to write the small script that saves you an hour of clicking.',
          },
          {
            type: 'paragraph',
            text:
              'Python is popular for hacking for three concrete reasons. First, it reads almost like English, so you can understand someone else\'s script without a manual. Second, it comes with batteries included - talking to a website, opening a socket, parsing JSON are all one import away, no setup. Third, it is glue: you can wrap a clunky command-line tool, feed it a list of targets, and collect the results, all in ten lines. That "glue" job is 90 percent of what a hacker actually writes.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the smallest useful example. This script reads a file of URLs, one per line, and prints each one with a number. That is it - but it is the shape of a real recon tool: read a list, do something to each item, print the result. You will write this pattern a hundred times.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'list_targets.py',
            code:
              "# read a list of targets and number them\n" +
              "with open('targets.txt') as f:\n" +
              "    for number, line in enumerate(f, start=1):\n" +
              "        url = line.strip()\n" +
              "        print(number, url)",
          },
          {
            type: 'paragraph',
            text:
              'Run it with `python3 list_targets.py` next to a `targets.txt` file and you get `1 example.com`, `2 test.example.com`, and so on. `open(...)` gets the file, the `for` loop walks it line by line, `enumerate` hands you a running count so you get the numbers for free, and `.strip()` removes the invisible newline at the end of each line. If a line prints with a weird gap after it, you forgot the `.strip()` - that newline is the single most common beginner bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Python 3 is the version you use - if a script says `print "hi"` with no brackets, it is ancient Python 2, skip it',
              'Run a script with `python3 name.py`',
              'Run one line quickly with `python3 -c "print(1+1)"`',
              '`#` starts a comment - everything after it on the line is ignored',
              'Indentation is not decoration in Python - it is the syntax, and it must be consistent',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because the difference between a beginner and someone who gets paid is often just automation. The beginner tries five payloads by hand and gets bored. The person with a bit of Python tries five hundred while they make chai, then reads the results. You are not learning Python to build an app. You are learning it so the boring, repetitive half of hacking runs itself.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Python 2 is dead',
            text:
              'If a tutorial or a Stack Overflow answer uses `print` without brackets, it is Python 2 and years out of date. Always use `python3`. When in doubt, run `python3 --version`.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know why almost every hacking tool is Python, you can run a script, and you have read a real ten-line recon tool end to end.',
          },
          {
            type: 'quiz',
            question: 'What does `.strip()` do to a line read from a file?',
            options: [
              'Deletes the whole line',
              'Removes the whitespace and newline at the ends',
              'Encrypts the line',
              'Turns it into a number',
            ],
            correctIndex: 1,
            explanation: 'Lines read from a file carry a trailing newline character; .strip() trims whitespace (including that newline) off both ends so the value is clean.',
          },
        ],
      },
      {
        slug: 'variables-and-types',
        title: 'Variables and Types',
        summary: 'A variable is a labelled dabba. What you put in it - text, number, or true/false - decides what you can do with it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A variable is just a labelled box - a dabba with a name on it. You put a value in, and later you use the name to get the value back. `target = "example.com"` puts the text `example.com` in a box labelled `target`. From then on, wherever you write `target`, Python swaps in that value. That is the whole idea, and every program is built on it.',
          },
          {
            type: 'paragraph',
            text:
              'What is inside the box has a type, and the type decides what you are allowed to do. A string (text) can be joined and searched. An integer (whole number) can be added and compared. A boolean is just `True` or `False` - the answer to a yes/no question, which is what every `if` in your code ends up checking. Mixing types by accident is the classic beginner trip: `"8080" + 1` errors, because you asked Python to add a number to a piece of text.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one worked example. Say you scanned a host and want to build a note. The port came back as the text `"443"` because you read it from a file, but you want to check if it is above 1024. You cannot compare text to a number, so you convert: `int("443")` turns the string into the integer `443`. Now `443 < 1024` is a real comparison that gives you `True`. Getting the type right before you compare is half of not-crashing.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'types_demo.py',
            code:
              "target = 'example.com'      # string - text\n" +
              "port = 443                  # integer - a number\n" +
              "is_https = (port == 443)    # boolean - True or False\n" +
              "\n" +
              "port_from_file = '8080'     # this is TEXT, not a number\n" +
              "port_number = int(port_from_file)   # convert it\n" +
              "print(target, port_number, is_https)",
          },
          {
            type: 'paragraph',
            text:
              'Running this prints `example.com 8080 True`. Notice `is_https` is `True` because `port` really was `443`. And `port_from_file` had quotes around it, so it was text until `int()` converted it - print `type(port_from_file)` and Python says `<class \'str\'>`, print `type(port_number)` and it says `<class \'int\'>`. When a script blows up with "unsupported operand type", this mismatch is almost always why.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`str` - text, always in quotes: `\'admin\'`, `"example.com"`',
              '`int` - whole numbers: `443`, `65535`',
              '`float` - numbers with a decimal: `1.5`',
              '`bool` - `True` or `False`, the answer to every yes/no check',
              '`int("443")` converts text to a number; `str(443)` converts a number to text',
              '`type(x)` tells you what something is when you are unsure',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters more in hacking than in normal coding. Data from the outside world - a web response, a file, user input - arrives as text, always. A status code, a port, a length, a price all come in as strings and you convert them before you can do maths or comparisons. Half the exploit scripts that fail on someone\'s machine fail here: they read a number as text and never converted it. Knowing types means your one-off script actually runs.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Everything from outside is text',
            text:
              'A number read from a file, a form, or a network response is a string until you convert it with `int()` or `float()`. Forget the conversion and your comparison silently does the wrong thing or crashes.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can store values, tell text from numbers from true/false, and convert between them - so your comparisons and maths actually work.',
          },
          {
            type: 'quiz',
            question: 'You read `"1024"` from a file and want to check if it is less than 2048. What must you do first?',
            options: [
              'Nothing, it just works',
              'Convert it with `int("1024")`',
              'Wrap it in more quotes',
              'Delete the quotes by hand in the file',
            ],
            correctIndex: 1,
            explanation: 'A value read from a file is a string. You must convert it to an integer with int() before comparing it numerically, or Python compares text to a number and errors.',
          },
        ],
      },
      {
        slug: 'lists-dicts-loops',
        title: 'Lists, Dicts and Loops',
        summary: 'A list is a row of boxes, a dict is a phone contact list, and a loop checks every flat on the floor.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Real work is never one thing - it is a hundred URLs, a table of ports, a pile of headers. You need containers to hold many values and a way to walk through them. Python gives you two containers you will use constantly - the list and the dict - and one loop that visits every item in either. Master these three and you can automate almost anything.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Lists: a row of boxes in order',
          },
          {
            type: 'paragraph',
            text:
              'A list is an ordered row of boxes: `ports = [22, 80, 443]`. The order is kept, and you reach any box by its position number, starting at zero - so `ports[0]` is `22` and `ports[2]` is `443`. You add with `ports.append(8080)` and check membership with `443 in ports`, which gives back `True`. Think of the floor of an apartment building: flat 0, flat 1, flat 2, in a fixed row.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Dicts: a labelled contact list',
          },
          {
            type: 'paragraph',
            text:
              'A dict (dictionary) is a contact list: instead of a position, you look things up by a name (the "key"). `service = {22: "ssh", 80: "http", 443: "https"}` lets you ask `service[443]` and get back `"https"`. You are not counting positions - you are looking up a value by its label, exactly like finding a number in your phone contacts by the person\'s name. When you scan a host and want "what runs on this port?", a dict is the answer.',
          },
          {
            type: 'paragraph',
            text:
              'Now the loop ties them together. A `for` loop walks every item, one at a time - like the watchman checking every flat on a floor, door by door, missing none. This is the single most useful pattern in hacking automation: take a list of things and do the same action to each. The script below loops over a list of ports and prints the service name for each, looked up from the dict.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'loop_ports.py',
            code:
              "ports = [22, 80, 443, 3306]\n" +
              "service = {22: 'ssh', 80: 'http', 443: 'https', 3306: 'mysql'}\n" +
              "\n" +
              "for port in ports:\n" +
              "    name = service.get(port, 'unknown')\n" +
              "    print(port, '->', name)",
          },
          {
            type: 'paragraph',
            text:
              'This prints four lines: `22 -> ssh`, `80 -> http`, `443 -> https`, `3306 -> mysql`. The loop takes each port from the list in turn and puts it in the variable `port`. `service.get(port, \'unknown\')` looks that port up in the dict and returns its name, or the word `unknown` if the port is not in the dict - using `.get` instead of `service[port]` means a missing port does not crash the script. Swap the `ports` list for a thousand scanned ports and the exact same six lines still work.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'List: ordered, reach items by position - `ports[0]`, add with `.append()`',
              'Dict: look up by key - `service[443]`, safer with `service.get(443, default)`',
              '`for item in things:` visits every item once, in order',
              '`443 in ports` and `443 in service` both check membership and return True/False',
              '`len(ports)` tells you how many items are in the container',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is the engine of every tool you will build. A subdomain enumerator is a loop over a list of names. A port scanner is a loop over a list of ports. A brute-force check (on a system you own) is a loop over a list of passwords. When you read someone else\'s exploit script and see a `for` loop over a list, you now know exactly what it is doing: the same action, applied to every target in turn.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Counting starts at zero',
            text:
              'The first item in a list is `ports[0]`, not `ports[1]`. This trips up everyone at first. A list of 3 items has positions 0, 1, and 2 - there is no position 3.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can hold many values in a list or a dict and run the same action over every one of them with a loop - the core of every automation script.',
          },
          {
            type: 'quiz',
            question: 'You have `service = {80: "http", 443: "https"}`. What does `service[443]` give you?',
            options: ['443', '"https"', 'The whole dict', 'An error'],
            correctIndex: 1,
            explanation: 'A dict looks up a value by its key. The key 443 maps to the value "https", so service[443] returns "https".',
          },
        ],
      },
      {
        slug: 'functions-and-files',
        title: 'Functions and File Handling',
        summary: 'A function is a reusable move you name once and call many times. Files are how your tool remembers.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Once your script does more than one thing, you want to name a chunk of work and reuse it. That named chunk is a function. And once your script produces results worth keeping, you want to write them to a file instead of losing them when the terminal closes. Functions and files are how a throwaway snippet grows into a tool you run again next week.',
          },
          {
            type: 'paragraph',
            text:
              'A function packs some steps under a name. You define it once with `def`, and after that you "call" it by name as many times as you like, feeding it different inputs. Think of a chai recipe: you write the steps once, then make chai for any number of guests by following the same recipe with a different count. The inputs you pass in are "arguments"; the value it hands back is what it "returns".',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete function. `is_interesting(port)` takes a port number and returns `True` if it is a port worth a closer look. You define the rule once, then call it for every port in a scan without repeating the logic. Pair that with writing results to a file, and you have the skeleton of a real recon tool: decide something per item, save the hits.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'save_hits.py',
            code:
              "def is_interesting(port):\n" +
              "    interesting = {21, 22, 3306, 6379, 8080}\n" +
              "    return port in interesting\n" +
              "\n" +
              "found = [22, 80, 443, 3306, 8080]\n" +
              "\n" +
              "with open('hits.txt', 'w') as out:\n" +
              "    for port in found:\n" +
              "        if is_interesting(port):\n" +
              "            out.write(str(port) + '\\n')\n" +
              "            print('saved', port)",
          },
          {
            type: 'paragraph',
            text:
              'Running this prints `saved 22`, `saved 3306`, `saved 8080`, and afterwards `hits.txt` contains those three numbers, one per line. `is_interesting` is called once per port and returns True or False, which the `if` checks. `open(\'hits.txt\', \'w\')` opens the file for writing (`\'w\'` means write, and it wipes any old contents), and `out.write(...)` adds a line - note the `str(port)` because you can only write text, and the `\\n` to start a new line. Open the file for reading with `\'r\'` instead of `\'w\'`.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`def name(args):` defines a function; call it later as `name(value)`',
              '`return` hands a value back to whoever called the function',
              '`open(path, \'r\')` reads, `open(path, \'w\')` writes (and erases first), `\'a\'` appends',
              'Always use `with open(...) as f:` - it closes the file for you automatically',
              'You can only write text to a file - convert numbers with `str()` first',
              '`\\n` is the newline character - without it everything runs together on one line',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because every tool you use reads a wordlist from a file and writes findings to another file. When you point ffuf at a wordlist, that is file reading. When sqlmap saves a session, that is file writing. Understanding functions means you can read an exploit script and follow which named piece does what, instead of seeing one intimidating wall of code. Understanding files means your own scripts produce results you still have tomorrow.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The \'w\' mode erases first',
            text:
              'Opening a file with `\'w\'` wipes whatever was there before you write a single byte. If you meant to add to an existing file, use `\'a\'` (append) instead, or you will silently destroy your earlier results.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can bundle logic into a named function you reuse, and read from and write to files so your tool remembers its work.',
          },
          {
            type: 'quiz',
            question: 'You want to add lines to a results file without erasing what is already in it. Which mode?',
            options: ['\'w\'', '\'r\'', '\'a\'', '\'x\''],
            correctIndex: 2,
            explanation: "'a' means append - it adds to the end of the file. 'w' would erase the existing contents first, and 'r' only reads.",
          },
        ],
      },
      {
        slug: 'errors-and-debugging',
        title: 'Errors and Debugging',
        summary: 'An error message is not the enemy - it is Python telling you exactly what went wrong and where.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Your script will crash. Everyone\'s does, constantly - that is normal, not a sign you are bad at this. The difference between someone who gets unstuck in ten seconds and someone who gives up is one skill: reading the error message. Python errors look scary but they are actually a helpful little report telling you what broke and on which line.',
          },
          {
            type: 'paragraph',
            text:
              'A crash prints a "traceback". Read it from the bottom up. The very last line is the error type and a short message - that is the what. Just above it is the file name and line number - that is the where. Everything in the middle is the chain of function calls that led there, which you can usually ignore at first. So your reading order is: last line (what happened), then the line number (where), then go look at that exact line.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real one. Say you run a script and get the traceback below. The bottom line says `KeyError: 8080`. That is Python saying "you asked a dict for the key `8080` and it is not in there". The line above points at `save_hits.py, line 5`. You go to line 5, see `service[8080]`, and realise you should have used `service.get(8080, \'unknown\')` so a missing key returns a default instead of crashing. Two minutes, fixed - because you read the message instead of staring at the whole file.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'traceback.txt',
            code:
              "Traceback (most recent call last):\n" +
              '  File "save_hits.py", line 5, in <module>\n' +
              "    print(service[8080])\n" +
              "KeyError: 8080",
          },
          {
            type: 'paragraph',
            text:
              'That block is exactly what a crash looks like. The last line, `KeyError: 8080`, is the diagnosis. The `line 5` and the shown code `print(service[8080])` are the location. Now compare to the common ones: `NameError` means you used a variable you never created (usually a typo in the name). `TypeError` means you mixed types, like adding text to a number. `IndexError` means you asked for a list position that does not exist. `FileNotFoundError` means the path is wrong. Each name points straight at the category of mistake.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Read tracebacks bottom-up: last line is the error, the line above is where',
              '`NameError` - you used a variable or function name that does not exist (typo?)',
              '`TypeError` - you mixed types, like `"8080" + 1`',
              '`IndexError` / `KeyError` - you asked for a list position or dict key that is not there',
              '`FileNotFoundError` - the file path is wrong or the file is not where you think',
              'Wrap risky code in `try:` / `except:` to keep the whole run from dying on one bad item',
            ],
          },
          {
            type: 'code',
            language: 'python',
            filename: 'safe_loop.py',
            code:
              "targets = ['example.com', '', 'test.example.com']\n" +
              "for t in targets:\n" +
              "    try:\n" +
              "        print('checking', t.upper())\n" +
              "    except Exception as e:\n" +
              "        print('skipped one:', e)",
          },
          {
            type: 'paragraph',
            text:
              'This shows the other half of debugging: not crashing on one bad item. The `try:` block runs the risky line, and if it throws, the `except:` catches it and prints a note instead of killing the whole script. When you loop over a thousand targets and item 347 is malformed, `try/except` lets the other 999 finish. Here every item happens to work, so it prints three `checking ...` lines - but the safety net is there for the day one item is `None` or garbage.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The error names the problem',
            text:
              'Copy the last line of a traceback into a search engine and you will find the fix in seconds. The error type plus the message is a precise question - `KeyError` and `TypeError` mean very different things.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a traceback, name the five common errors on sight, and use try/except so one bad item does not kill a whole run.',
          },
          {
            type: 'practice_ref',
            title: 'Python Basics check',
            exerciseSlug: 'python-basics-quiz',
          },
          {
            type: 'quiz',
            question: 'A traceback ends with `NameError: name \'reqeusts\' is not defined`. What is the likely cause?',
            options: [
              'The internet is down',
              'A typo - it should be `requests`',
              'The file is too big',
              'Python 2 vs 3',
            ],
            correctIndex: 1,
            explanation: 'A NameError means you used a name Python has never seen. Here `reqeusts` is a misspelling of `requests`, so Python has no such name defined.',
          },
        ],
      },
      {
        slug: 'virtualenv-and-pip',
        title: 'pip and Virtual Environments',
        summary: 'pip installs other people\'s code; a virtual environment keeps each project\'s installs from stepping on each other.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You will not write everything from scratch. When you need to talk to a website, you install a library called `requests` instead of writing raw HTTP. `pip` is the tool that installs these libraries, and a virtual environment is a clean, isolated box you install them into so one project\'s libraries do not clash with another\'s. This is housekeeping, but skipping it is why "it works on my machine" turns into a bad afternoon.',
          },
          {
            type: 'paragraph',
            text:
              'pip is Python\'s package installer. `pip install requests` downloads the requests library from the internet and makes it importable in your scripts. The problem: if you install everything into one shared Python, tool A that needs an old version and tool B that needs a new version will fight, and one breaks. A virtual environment (venv) solves this - it is a private, per-project copy of Python and its installed libraries. You "activate" it, install what that project needs, and its libraries live only in that box.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the full cycle. You make a venv folder, activate it so `pip` and `python` now point inside that box, install a library, and see it appear only there. Deactivate and it is as if that install never touched your system Python. Every serious Python tool you download will tell you to do exactly this, so it is worth the two minutes.',
          },
          {
            type: 'command',
            description: 'Create and activate a virtual environment on Linux/macOS, then install a library into it:',
            commands: [
              'python3 -m venv .venv',
              'source .venv/bin/activate',
              'pip install requests',
              'pip list',
            ],
          },
          {
            type: 'paragraph',
            text:
              'After `source .venv/bin/activate`, your prompt gains a `(.venv)` prefix - that is how you know you are inside the box. `pip install requests` now installs into `.venv` only, not your whole system. `pip list` prints every library in this environment and its version, so you can confirm requests landed. Type `deactivate` to leave, and the prefix disappears; run `pip list` again outside and requests is gone from view. On Windows the activate line is `.venv\\Scripts\\activate` instead.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`pip install <name>` - download and install a library',
              '`python3 -m venv .venv` - create a virtual environment in a `.venv` folder',
              '`source .venv/bin/activate` (Linux/macOS) or `.venv\\Scripts\\activate` (Windows) - enter it',
              '`deactivate` - leave the environment',
              '`pip freeze > requirements.txt` - save the exact versions so someone else can reproduce them',
              '`pip install -r requirements.txt` - install everything a project lists',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because most hacking tools you clone from GitHub ship a `requirements.txt` and assume you will make a venv. Do it, and the tool installs cleanly and does not pollute your system. Skip it, and you eventually hit the version-conflict mess where installing one tool breaks another. A venv per tool is cheap insurance, and reading a `requirements.txt` also tells you at a glance what a tool depends on before you run it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'One venv per project',
            text:
              'Make a fresh virtual environment for each tool you clone. Disk is cheap; untangling two tools that overwrote each other\'s library versions is not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can install libraries with pip and keep each project\'s dependencies isolated in its own virtual environment.',
          },
          {
            type: 'quiz',
            question: 'Why make a virtual environment for each project?',
            options: [
              'It makes Python faster',
              'It keeps one project\'s library versions from clashing with another\'s',
              'It encrypts your code',
              'It is required to run any script',
            ],
            correctIndex: 1,
            explanation: 'A venv isolates each project\'s installed libraries, so a version one tool needs cannot break another tool that needs a different version.',
          },
        ],
      },
    ],
  },
  {
    slug: 'python-for-security',
    title: 'Python for Security',
    description:
      'Turn the Python you just learned into recon and exploitation tooling. By the end you can fire HTTP requests and read the responses in code, pull data out of HTML and JSON, build a working TCP port scanner from raw sockets, chain a repetitive check into a loop that runs itself, and write a small script that automates a real finding - the point where Python stops being a language and starts being your toolkit.',
    lessons: [
      {
        slug: 'requests-and-http-in-python',
        title: 'HTTP with requests',
        summary: 'Fire a web request from code, read the status and body, and you have the core of every web tool.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Python requests in 6 minutes - GET, POST, headers and reading the response'),
          {
            type: 'paragraph',
            text:
              'Your browser sends web requests for you. To hack the web, you send them yourself - from code - so you can change anything, repeat it a thousand times, and read the raw answer. The `requests` library is how Python does this, and it is so clean that a full request-and-check fits in three lines. This one library is the foundation under almost every web tool you will ever write.',
          },
          {
            type: 'paragraph',
            text:
              'A web request has a method (GET to fetch, POST to send data), a URL, optional headers, and an optional body. The server replies with a status code (200 means OK, 404 means not found, 500 means the server broke), response headers, and a body (usually HTML or JSON). `requests` hands you all of that as a Python object: `r.status_code` is the number, `r.headers` is a dict of headers, and `r.text` is the body as text. You install it with `pip install requests` inside your venv first.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one worked request. `requests.get("https://example.com/admin")` sends a GET and returns a response object into `r`. You check `r.status_code`: a 200 means the admin page loaded (interesting), a 401 or 403 means it exists but is protected, a 404 means it is not there. That single check - "does this path exist, and is it protected?" - repeated over a wordlist, is exactly what content-discovery tools do.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'check_paths.py',
            code:
              "import requests\n" +
              "\n" +
              "base = 'https://example.com'\n" +
              "paths = ['/admin', '/login', '/backup.zip', '/.git/config']\n" +
              "\n" +
              "for path in paths:\n" +
              "    r = requests.get(base + path, timeout=5)\n" +
              "    print(r.status_code, path, len(r.text), 'bytes')",
          },
          {
            type: 'paragraph',
            text:
              'This loops over four paths and prints each one\'s status code and response size, giving lines like `200 /admin 5312 bytes`, `404 /backup.zip 190 bytes`, `200 /.git/config 88 bytes`. Read it like a hunter: `200` on `/.git/config` is a real signal - an exposed git config should not be public. The `len(r.text)` matters too, because a site that returns `200` for everything (a soft-404) still gives different sizes for real vs fake pages, so the length column separates them. `timeout=5` stops one dead host from hanging your whole run.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`requests.get(url)` - fetch a page; `requests.post(url, data={...})` - send data',
              '`r.status_code` - the number: 200 OK, 301/302 redirect, 401/403 protected, 404 missing, 500 server error',
              '`r.text` - the body as text; `r.json()` - the body parsed if it is JSON',
              '`r.headers` - response headers as a dict, e.g. `r.headers.get(\'Server\')`',
              '`requests.get(url, headers={...}, timeout=5)` - set your own headers and never hang forever',
              '`allow_redirects=False` - see the raw redirect instead of following it',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because once you can send a request from code, you can send any request. Change a cookie, forge a header, replay a POST with a different user ID, spray a list of paths - all just fields you set on the call. A tool like a directory buster is this exact loop with a bigger wordlist and prettier output. Learning `requests` is learning to talk to a web server on your own terms instead of through a browser that only does what the page allows.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Always set a timeout',
            text:
              'Without `timeout=`, one unresponsive server can freeze your whole script forever. Every request in a loop should carry a timeout so a single dead host cannot stall a run over a thousand targets.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own targets only',
            text:
              'Only send automated requests to sites you own or have written permission to test. Hammering someone else\'s server with a script is unauthorised and can be a crime.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can send GET and POST requests from Python, read the status code and body, and loop a check over a list of paths - the core of every web recon tool.',
          },
          {
            type: 'quiz',
            question: 'A request to `/.git/config` returns status code 200. Why is that interesting?',
            options: [
              'It means the server is fast',
              'A public git config should not be exposed - it can leak source and secrets',
              '200 always means a bug',
              'It means the page is protected',
            ],
            correctIndex: 1,
            explanation: 'A 200 means the file loaded successfully. An exposed .git/config is a real finding because it can reveal the repository and lead to source code or credential disclosure.',
          },
        ],
      },
      {
        slug: 'parsing-html-and-json',
        title: 'Parsing HTML and JSON',
        summary: 'A response is a haystack. Parsing is pulling out the one link, field or token you actually need.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Parsing responses in Python - BeautifulSoup for HTML, json for APIs'),
          {
            type: 'paragraph',
            text:
              'You fetched a page or an API response. Now what? The body is a big blob of text, and buried in it is the one thing you want - a link, a hidden form field, an auth token, a list of users. Parsing is the act of turning that blob into something you can reach by name instead of eyeballing it. Two kinds of body cover almost everything: HTML (web pages) and JSON (APIs).',
          },
          {
            type: 'paragraph',
            text:
              'JSON is the easy one because it is already structured - it is basically Python dicts and lists in text form. `r.json()` turns an API response straight into a dict you index by key: `data[\'users\'][0][\'email\']` walks into the users list, takes the first one, and reads its email. HTML is messier - it is a tree of tags - so you use a library called BeautifulSoup to search it. `soup.find_all(\'a\')` finds every link tag; `soup.find_all(\'input\')` finds every form field, which is how you spot hidden inputs a page does not show you.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a JSON example end to end. Say an API returns `{"users": [{"id": 1, "name": "asha", "role": "admin"}]}`. After `data = r.json()`, `data[\'users\']` is a list, `data[\'users\'][0]` is the first user dict, and `data[\'users\'][0][\'role\']` is the string `admin`. You just extracted one field from a nested response with three lookups. Loop over `data[\'users\']` and you can list every user\'s role - which is exactly how you notice an API is leaking who the admins are.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'parse_both.py',
            code:
              "import requests\n" +
              "from bs4 import BeautifulSoup\n" +
              "\n" +
              "# JSON from an API\n" +
              "data = requests.get('https://example.com/api/users', timeout=5).json()\n" +
              "for user in data['users']:\n" +
              "    print(user['id'], user['name'], user['role'])\n" +
              "\n" +
              "# HTML from a page - pull every link and every input field\n" +
              "html = requests.get('https://example.com/login', timeout=5).text\n" +
              "soup = BeautifulSoup(html, 'html.parser')\n" +
              "for tag in soup.find_all('input'):\n" +
              "    print('field:', tag.get('name'), '=', tag.get('value'))",
          },
          {
            type: 'paragraph',
            text:
              'The first loop prints one line per user, like `1 asha admin` - reading fields out of parsed JSON by key. The second loop prints every input on the login form, like `field: username =`, `field: csrf_token = a1b2c3`. That second line is gold: it just revealed a hidden `csrf_token` field and its value, which you would need to submit the form from a script. `tag.get(\'name\')` reads an attribute safely (returning `None` if absent) rather than crashing. Install BeautifulSoup with `pip install beautifulsoup4` first.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`r.json()` - parse a JSON response into a dict/list you index by key',
              'Reach nested JSON with chained lookups: `data[\'users\'][0][\'role\']`',
              '`BeautifulSoup(html, \'html.parser\')` - turn an HTML string into a searchable tree',
              '`soup.find_all(\'a\')` - every link; read the URL with `tag.get(\'href\')`',
              '`soup.find_all(\'input\')` - every form field, including hidden ones',
              '`tag.get(\'name\')` returns None if missing, safer than `tag[\'name\']`',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because the interesting data is never on the surface. Hidden form fields, CSRF tokens, API keys accidentally embedded in a page, a JSON endpoint that returns more fields than the UI shows - all of it is one parse away. A scraper that finds every subdomain in a page, a script that extracts a token to reuse in the next request, a check that reads an API\'s user list for a role it should not expose - these are all just fetch-then-parse. The fetch you already know; parsing is what makes the response useful.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'JSON is just dicts and lists',
            text:
              'Once you call `r.json()`, everything you learned about dicts and lists applies directly. `[]` for a list position, `[\'key\']` for a dict value, and a loop to walk them.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can pull the exact field you need out of a JSON API response or an HTML page, including the hidden inputs a browser never shows you.',
          },
          {
            type: 'quiz',
            question: 'An API returns `{"user": {"role": "admin"}}` into `data`. How do you read the role?',
            options: [
              "data('role')",
              "data['user']['role']",
              "data.role.user",
              "data[0][1]",
            ],
            correctIndex: 1,
            explanation: "It is nested dicts: data['user'] gives the inner dict, and ['role'] reads its value. You chain key lookups to reach a nested value.",
          },
        ],
      },
      {
        slug: 'sockets-and-port-scanner',
        title: 'Build a Port Scanner',
        summary: 'Write a real port scanner from scratch. It is a loop and a socket - and you will understand nmap forever after.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('Build a port scanner in Python - sockets, connect, and reading the result'),
          {
            type: 'paragraph',
            text:
              'You have used nmap. Now build a tiny version of it yourself, because writing the thing teaches you what the thing does. A port scanner answers one question for each port: "if I knock, does anyone answer?" In Python that knock is a socket connection, and the whole scanner is a loop over a list of ports with one connect attempt each. Thirty minutes here and nmap stops being magic.',
          },
          {
            type: 'paragraph',
            text:
              'A socket is your program\'s end of a network conversation. To test a port, you create a socket, aim it at an IP and port, and try to connect. If the connection succeeds, something is listening - the port is open. If it is refused or times out, nothing useful is there. `socket.socket(socket.AF_INET, socket.SOCK_STREAM)` makes a TCP socket, `settimeout(1)` stops it waiting forever on a dead port, and `connect_ex((ip, port))` tries the connection and returns `0` on success instead of raising an error - which makes it perfect for a loop.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the logic for one port. You make a socket, set a one-second timeout, and call `connect_ex(("example.com", 22))`. If it returns `0`, port 22 answered - SSH is probably up. Any other number means no. You close the socket and move to the next port. That is the entire mechanism; the scanner below just wraps it in a loop over a handful of common ports so one run tells you which of them are open.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'scanner.py',
            code:
              "import socket\n" +
              "\n" +
              "target = 'example.com'\n" +
              "ports = [21, 22, 80, 443, 3306, 8080]\n" +
              "\n" +
              "for port in ports:\n" +
              "    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n" +
              "    s.settimeout(1)\n" +
              "    result = s.connect_ex((target, port))\n" +
              "    if result == 0:\n" +
              "        print('OPEN  ', port)\n" +
              "    else:\n" +
              "        print('closed', port)\n" +
              "    s.close()",
          },
          {
            type: 'paragraph',
            text:
              'Run this against a host you own and you get a line per port: `OPEN   22`, `closed  21`, `OPEN   443`, and so on. `connect_ex` returning `0` is what prints `OPEN` - a real TCP handshake completed, so a service is listening there. Anything else falls into `closed`. The `settimeout(1)` is doing quiet heavy lifting: without it, a filtered port (one a firewall silently drops) would make your script hang for the operating system\'s full default timeout. Lower the timeout and the scan is faster but starts missing slow hosts - the exact speed-versus-accuracy trade-off nmap makes for you.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`socket.socket(socket.AF_INET, socket.SOCK_STREAM)` - create a TCP (IPv4) socket',
              '`s.settimeout(1)` - give up after one second so a dead port does not hang the loop',
              '`s.connect_ex((host, port))` - returns 0 if the port is open, non-zero otherwise (no crash)',
              '`s.close()` - always close each socket when done with it',
              'Open = a service accepted the connection; closed/filtered = nothing usable answered',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because now you understand every scanner you use. When nmap says a port is "filtered" instead of "closed", you know it means the connection neither succeeded nor was cleanly refused - a firewall ate it silently, which is why filtered ports are slow. When you tune scan speed, you are tuning that timeout. And the moment you can write this loop, you can extend it: grab the banner a service sends back, scan a whole subnet, or feed the open ports into your next tool. That is the leap from tool user to tool builder.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The timeout is the whole game',
            text:
              'A short timeout scans fast but misses slow or distant hosts; a long one is thorough but crawls. Every scanner in the world is trading off exactly this number.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Scan only what you own',
            text:
              'Port-scanning a host you have no permission to test is unauthorised access in many places. Point this at your own machine, a lab box, or a target with explicit permission - nothing else.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You built a working TCP port scanner from raw sockets, and you now understand exactly what open, closed and filtered mean under any scanner you use.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'quiz',
            question: 'In the scanner, what does `connect_ex` returning `0` mean?',
            options: [
              'The port is closed',
              'The connection succeeded - the port is open',
              'The script crashed',
              'The host does not exist',
            ],
            correctIndex: 1,
            explanation: 'connect_ex returns 0 when the TCP connection succeeds, meaning a service is listening and the port is open. Any non-zero value means it did not connect.',
          },
        ],
      },
      {
        slug: 'automating-with-python',
        title: 'Automating the Boring Parts',
        summary: 'The real skill is not one clever script - it is chaining dull, repetitive steps so they run while you sleep.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The point of Python for a hacker is not one genius exploit. It is automating the dozens of dull steps you would otherwise do by hand: checking a hundred URLs, testing every parameter, re-running yesterday\'s recon to see what changed. A human gets bored and sloppy at step forty. A loop does step four hundred exactly like step one. This lesson is about turning a manual chore into a script that grinds through it for you.',
          },
          {
            type: 'paragraph',
            text:
              'Automation is three ingredients you already have: a list of things to do, a loop over that list, and something saved from each pass. Add two practical touches for real runs. First, be polite and safe - a small `time.sleep()` between requests keeps you from hammering a server and getting blocked. Second, be resilient - wrap each item in `try/except` so one failure does not kill the whole batch. That is the difference between a script that finishes a thousand items and one that dies on item three.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete automation. You have a file of subdomains and you want to know which ones are alive and what web server each runs. The script reads the file, loops each subdomain, requests it, and records the status code and the `Server` header. Left running, it turns a tedious "open each in a browser" job into a single file of results you read in ten seconds.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'check_live.py',
            code:
              "import requests, time\n" +
              "\n" +
              "with open('subdomains.txt') as f:\n" +
              "    subs = [line.strip() for line in f if line.strip()]\n" +
              "\n" +
              "with open('alive.txt', 'w') as out:\n" +
              "    for sub in subs:\n" +
              "        url = 'https://' + sub\n" +
              "        try:\n" +
              "            r = requests.get(url, timeout=5)\n" +
              "            server = r.headers.get('Server', '?')\n" +
              "            line = f'{r.status_code} {sub} [{server}]'\n" +
              "            print(line)\n" +
              "            out.write(line + '\\n')\n" +
              "        except Exception:\n" +
              "            print('dead  ', sub)\n" +
              "        time.sleep(0.3)",
          },
          {
            type: 'paragraph',
            text:
              'This prints and saves lines like `200 app.example.com [nginx]`, `403 admin.example.com [Apache]`, and `dead   old.example.com` for hosts that did not answer. `r.headers.get(\'Server\', \'?\')` reads the server banner, or `?` if the header is missing - that banner narrows what software you are dealing with. The `try/except` means a dead subdomain prints `dead` and the loop keeps going instead of crashing. `time.sleep(0.3)` pauses a third of a second between requests, so you are not machine-gunning the target. The `[line.strip() ...]` at the top reads the file and drops blank lines in one go.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Automation = a list + a loop + saving each result',
              '`time.sleep(0.3)` - pause between requests to be polite and avoid rate-limit blocks',
              '`try/except` around each item - one failure should never kill the whole run',
              'Read a file into a clean list: `[line.strip() for line in f if line.strip()]`',
              'Write results as you go, not at the end - a crash then still leaves what you already found',
              '`r.headers.get(\'Server\', \'?\')` - read a header safely with a fallback',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because automation is the multiplier that separates hobby from output. Every professional workflow is stitched-together scripts: recon feeds a live-host check, which feeds a content scan, which feeds a vuln check. You do not need all of that today - you need to see that any repetitive step you catch yourself doing by hand is a five-line loop away from running itself. The habit of asking "could a script do this?" is worth more than any single tool.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Speed gets you blocked',
            text:
              'A script with no delay can fire hundreds of requests a second, which looks exactly like an attack and gets your IP banned - or worse, breaks a fragile target. Add a `sleep`, respect rate limits, and slow down on anything you do not own.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Automate only in scope',
            text:
              'Running an automated check across a target\'s assets is only legal within an authorised scope. Confirm you are allowed before you point a loop at anything that is not yours.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can turn a repetitive manual chore into a resilient, polite loop that reads a list, handles failures, and saves results as it runs.',
          },
          {
            type: 'quiz',
            question: 'Why add `time.sleep()` between requests in an automation loop?',
            options: [
              'It makes Python run faster',
              'To avoid hammering the server and getting rate-limited or blocked',
              'It is required by Python syntax',
              'To encrypt the requests',
            ],
            correctIndex: 1,
            explanation: 'A short sleep spaces out your requests so you do not overwhelm the target or trip rate limits that would block your IP. It is both politeness and self-preservation.',
          },
        ],
      },
      {
        slug: 'writing-your-first-exploit-script',
        title: 'Your First Exploit Script',
        summary: 'Take a bug you found by hand and turn it into a clean, repeatable proof-of-concept script.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You found something by hand - maybe changing a number in a URL showed you another user\'s data. A great finding, but "I clicked around and it worked" is not a report. Turning that into a small script does two jobs: it proves the bug reliably (a triager can run it), and it lets you test the full range fast (is it one record, or every record?). This lesson turns a manual observation into a proof-of-concept, using only what you already know.',
          },
          {
            type: 'paragraph',
            text:
              'A proof-of-concept (PoC) script does the smallest thing that demonstrates the bug, clearly. It is not a weapon - it is evidence. The shape is always the same: set up the request that triggers the issue, run it (often in a loop to show scale), and print a clear result that makes the problem obvious. Keep it short and readable, because a triager who cannot understand your PoC in thirty seconds may just close your report.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real example: an IDOR (accessing objects by guessing IDs). By hand, you saw that `GET /api/invoice/1001` returned your invoice, and `1002` returned someone else\'s. The PoC loops over a small range of IDs, requests each, and prints whose invoice came back - demonstrating that the endpoint hands out records without checking who is asking. Notice it only reads a handful of IDs on a target you are authorised to test; a PoC proves the bug, it does not vacuum up real people\'s data.',
          },
          {
            type: 'code',
            language: 'python',
            filename: 'idor_poc.py',
            code:
              "import requests\n" +
              "\n" +
              "# Authorised test target only. Your own session cookie.\n" +
              "cookies = {'session': 'YOUR_SESSION_COOKIE'}\n" +
              "base = 'https://example.com/api/invoice/'\n" +
              "\n" +
              "for invoice_id in range(1001, 1006):\n" +
              "    r = requests.get(base + str(invoice_id), cookies=cookies, timeout=5)\n" +
              "    if r.status_code == 200:\n" +
              "        data = r.json()\n" +
              "        print(f'LEAK id={invoice_id} owner={data.get(\"customer\")} total={data.get(\"amount\")}')\n" +
              "    else:\n" +
              "        print(f'id={invoice_id} blocked ({r.status_code})')",
          },
          {
            type: 'paragraph',
            text:
              'Run against an authorised target and it prints lines like `LEAK id=1001 owner=asha total=4200`, `LEAK id=1002 owner=ravi total=980`. That is the finding, proven: with one logged-in session you pulled back invoices belonging to different customers, which means the endpoint never checks that the invoice belongs to you. `range(1001, 1006)` walks five IDs, `cookies=` sends your own login so you are testing authenticated access control, and the `LEAK` line names the owner so the impact is undeniable. A `blocked (403)` line would instead show the endpoint doing its job - equally useful to know.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'A PoC is evidence, not an attack - do the minimum that proves the bug clearly',
              'Structure: set up the request, run it (a small loop to show scale), print an obvious result',
              '`cookies={...}` on a request sends your own session so you test as a logged-in user',
              '`range(start, stop)` walks IDs; keep the range tiny - you are proving, not harvesting',
              'Print a result a triager understands in seconds: what leaked and whose it was',
              'Add a comment naming the authorised target so nobody runs it somewhere it should not go',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is where everything in this level pays off. Variables hold your target and IDs, a loop walks the range, `requests` sends the calls, `r.json()` parses the response, an `if` decides what counts as a leak. None of it is new - you assembled it into a tool that turns "I think this is a bug" into "here is a script, run it, watch it happen". That reproducibility is what gets a report accepted and paid. A clear PoC is often the difference between a triager fixing your bug and closing it as "could not reproduce".',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Prove it, do not plunder it',
            text:
              'A PoC pulls back just enough to demonstrate the issue - a few records, IDs blanked in your report. Downloading every record you can reach turns a clean finding into real harm and can flip your legal footing entirely.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Written authorisation, every time',
            text:
              'Running an exploit script against a system without explicit written permission is illegal, full stop. A PoC belongs on your own lab, a deliberately vulnerable app, or a target inside a program that authorises testing.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can turn a manual finding into a clean, repeatable proof-of-concept script that proves the bug to a triager - the skill that gets reports accepted.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'idor',
            title: 'Deep dive: IDOR - Changing the Number',
          },
          {
            type: 'practice_ref',
            title: 'Python for Security check',
            exerciseSlug: 'python-for-security-quiz',
          },
          {
            type: 'quiz',
            question: 'What is the main purpose of a proof-of-concept script in a bug report?',
            options: [
              'To download as much data as possible',
              'To reliably prove the bug so a triager can reproduce it',
              'To make the attack faster',
              'To hide who found the bug',
            ],
            correctIndex: 1,
            explanation: 'A PoC is evidence: it demonstrates the vulnerability clearly and repeatably so the person triaging your report can confirm it. It is not about maximising data or damage.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'errors-and-debugging',
    slug: 'python-basics-quiz',
    title: 'Python Basics check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'You read `"8080"` from a file and want to compare it to the number 1024. What must you do first?',
        options: [
          'Nothing, Python figures it out',
          'Convert it with `int("8080")`',
          'Add more quotes around it',
          'Restart the script',
        ],
        correctIndex: 1,
        explanation: 'Values read from a file are strings. Convert to an integer with int() before any numeric comparison, or Python compares text to a number and errors.',
      },
      {
        prompt: 'Which container do you use to look up a value by a name (key) rather than a position?',
        options: ['A list', 'A dict', 'A string', 'A boolean'],
        correctIndex: 1,
        explanation: 'A dict maps keys to values, so you look up by key like `service[443]`. A list is reached by numeric position instead.',
      },
      {
        prompt: 'What is the first item of the list `ports = [22, 80, 443]`?',
        options: ['ports[1] which is 22', 'ports[0] which is 22', 'ports[1] which is 80', 'ports[0] which is 80'],
        correctIndex: 1,
        explanation: 'List positions start at zero, so ports[0] is the first item, 22.',
      },
      {
        prompt: 'A traceback ends with `TypeError`. What kind of mistake does that point to?',
        options: [
          'A missing file',
          'A misspelled variable name',
          'Mixing types, like adding text to a number',
          'The internet is down',
        ],
        correctIndex: 2,
        explanation: 'A TypeError means an operation got the wrong type, such as "8080" + 1 which tries to add a string to an integer.',
      },
      {
        prompt: 'You open a results file with mode `\'w\'` and write to it. What happened to its old contents?',
        options: [
          'They were kept and you appended',
          'They were erased before writing',
          'They were encrypted',
          'The file was renamed',
        ],
        correctIndex: 1,
        explanation: "Mode 'w' truncates (erases) the file before writing. Use 'a' to append and keep the existing contents.",
      },
    ],
  },
  {
    lessonSlug: 'writing-your-first-exploit-script',
    slug: 'python-for-security-quiz',
    title: 'Python for Security check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which attribute of a `requests` response gives you the HTTP status code?',
        options: ['r.code', 'r.status_code', 'r.status', 'r.http'],
        correctIndex: 1,
        explanation: 'r.status_code holds the number, e.g. 200, 403 or 404. r.text holds the body and r.headers holds the response headers.',
      },
      {
        prompt: 'You called `data = r.json()` on an API response `{"user": {"role": "admin"}}`. How do you read the role?',
        options: ["data['role']", "data['user']['role']", "data.role", "data[0]"],
        correctIndex: 1,
        explanation: "Parsed JSON is nested dicts. data['user'] gives the inner dict and ['role'] reads its value.",
      },
      {
        prompt: 'In the port scanner, `connect_ex((host, port))` returns 0. What does that tell you?',
        options: [
          'The port is closed',
          'The port is open - a service accepted the connection',
          'The host is offline',
          'The socket crashed',
        ],
        correctIndex: 1,
        explanation: '0 means the TCP connection succeeded, so a service is listening and the port is open. Non-zero means it did not connect.',
      },
      {
        prompt: 'Why put a `time.sleep()` inside an automation loop that hits a web target?',
        options: [
          'It makes the script run faster',
          'To space out requests and avoid getting rate-limited or blocked',
          'Python requires it after every request',
          'It compresses the responses',
        ],
        correctIndex: 1,
        explanation: 'A short pause spaces out your requests so you do not overwhelm the target or trip rate limits that would ban your IP.',
      },
      {
        prompt: 'What is the main job of a proof-of-concept script?',
        options: [
          'To download every record it can reach',
          'To reliably prove the bug so a triager can reproduce it',
          'To attack as many hosts as possible',
          'To hide the researcher\'s identity',
        ],
        correctIndex: 1,
        explanation: 'A PoC is evidence. It demonstrates the vulnerability clearly and repeatably; it is not about maximising data or damage.',
      },
    ],
  },
];
