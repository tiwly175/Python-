    ]
  },
  {
    title: "Quantum Computing", file: "18_quantum",
    lessons: [
      {
        id: "18-1", file: "qiskit_basic.py", title: "Qubit & Quantum Gates ด้วย Qiskit",
        tagline: "โลกที่ bit เป็น 0 และ 1 พร้อมกัน — Quantum Computing",
        body: `<p><b>Quantum Computer</b> ใช้ <b>qubit</b> ซึ่งต่างจาก bit ปกติ — qubit อยู่ใน superposition (เป็น 0 และ 1 พร้อมกันได้)</p>
          <p><b>Qiskit</b> คือ framework ของ IBM เขียน quantum circuit บน Python แล้วรันบน simulator หรือ quantum computer จริง (IBM Quantum ฟรีสำหรับผู้เรียน)</p>
          <p>ติดตั้ง: <code>pip install qiskit qiskit-aer</code></p>`,
        examples: [
          { label: "hello_qubit.py", note: "Circuit แรก — วัด qubit", code: `from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\nqc = QuantumCircuit(1, 1)\nqc.measure(0, 0)\n\nsim = AerSimulator()\nresult = sim.run(qc, shots=1000).result()\nprint(result.get_counts())`, realLabel: "superposition.py", real: `from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\nfrom qiskit.visualization import plot_histogram\n\n<span class="cmt"># H gate → qubit เป็น 0 และ 1 พร้อมกัน</span>\nqc = QuantumCircuit(1, 1)\nqc.h(0)          <span class="cmt"># Hadamard — สร้าง superposition</span>\nqc.measure(0, 0)\n\nsim = AerSimulator()\ncounts = sim.run(qc, shots=10000).result().get_counts()\nprint(counts)\n<span class="cmt"># {'0': ~5000, '1': ~5000} — สุ่ม 50/50 จริง</span>\n\n<span class="cmt"># เทียบกับ classical bit — เป็นได้แค่ 0 หรือ 1</span>`
          },
          { label: "circuit.py", note: "Quantum circuit หลาย gate", code: `qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)     <span class="cmt"># CNOT (entangle)</span>\nqc.measure_all()`, realLabel: "bell_state.py", real: `from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\n<span class="cmt"># Bell State: qubit 2 ตัว entangle กัน</span>\nqc = QuantumCircuit(2)\nqc.h(0)         <span class="cmt"># q0 = superposition</span>\nqc.cx(0, 1)     <span class="cmt"># q1 = q0 (entangle)</span>\nqc.measure_all()\n\ncounts = AerSimulator().run(qc, shots=10000).result().get_counts()\nprint(counts)\n<span class="cmt"># {'00': ~5000, '11': ~5000}</span>\n<span class="cmt"># ไม่มี 01 หรือ 10 — entangled!</span>\n\n<span class="cmt"># Einstein เรียกว่า "spooky action at a distance"</span>\n<span class="cmt"># วัด qubit หนึ่ง → รู้ค่าอีก qubit ทันที</span>`
          }
        ],
        callout: "Quantum simulator รันบนคอมปกติได้ — แต่ quantum computer จริงเร็วกว่าแบบ exponential สำหรับงานเฉพาะทางเท่านั้น (factor, simulation)",
        hints: [
          "IBM Quantum ให้ 10 นาที/เดือน ฟรี — สมัคร ibm.com/quantum",
          "states |0⟩ |1⟩ |+⟩ |−⟩ — |+⟩ = (|0⟩+|1⟩)/√2 = superposition"
        ],
        techniques: [
          "H gate สร้าง superposition · CX/CNOT สร้าง entanglement",
          "shots = จำนวนครั้งที่รัน measurement — ยิ่งเยอะยิ่งแม่นสถิติ",
          "Simulator AerSimulator รันได้ในคอม — ไม่ต้องใช้ quantum machine จริง"
        ],
        practice: "สร้าง circuit 3 qubit: H ที่ qubit 0, CX(0,1), CX(1,2) — รัน 10000 shots ดูว่า counts ออกมาเป็นอะไร ทำไม"
      },
      {
        id: "18-2", file: "quantum_algo.py", title: "Quantum Algorithm — Deutsch, Grover, Shor",
        tagline: "อัลกอริทึมที่ quantum เร็วกว่า classical แบบเห็นชัด",
        body: `<p>อัลกอริทึม quantum ที่โด่งดัง:</p>
          <ul>
            <li><b>Deutsch-Jozsa</b> — แยก function constant vs balanced ในครั้งเดียว (classical ต้อง 2^(n-1)+1)</li>
            <li><b>Grover</b> — ค้นหาใน unsorted list O(√N) vs classical O(N)</li>
            <li><b>Shor</b> — factor ตัวเลขใหญ่ exponential → polynomial (ทำ RSA พัง)</li>
          </ul>`,
        examples: [
          { label: "grover.py", note: "Grover — ค้นหา O(√N)", code: `from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\n<span class="cmt"># n qubit, oracle + diffuser</span>\nqc = QuantumCircuit(2)\nqc.h([0, 1])\n<span class="cmt"># oracle (ซ่อนคำตอบ |11⟩)</span>\nqc.cz(0, 1)\n<span class="cmt"># diffuser</span>\nqc.h([0, 1]); qc.z([0, 1]); qc.cz(0, 1); qc.h([0, 1])\nqc.measure_all()`, realLabel: "grover_full.py", real: `from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\nfrom math import pi, sqrt, floor\n\n\ndef grover(n_qubits: int, target: int) -&gt; dict:\n    <span class="cmt">"""ค้นหา target จาก 2^n ค่า"""</span>\n    qc = QuantumCircuit(n_qubits)\n\n    <span class="cmt"># 1. superposition ทุกค่า</span>\n    qc.h(range(n_qubits))\n\n    <span class="cmt"># 2. จำนวนรอบ = π/4 · √N</span>\n    iterations = floor(pi / 4 * sqrt(2 ** n_qubits))\n\n    for _ in range(iterations):\n        <span class="cmt"># --- Oracle: mark target ---</span>\n        <span class="cmt"># phase flip ถ้า state ตรง target</span>\n        for i in range(n_qubits):\n            if not (target &gt;&gt; i) &amp; 1:\n                qc.x(i)\n        qc.h(n_qubits - 1)\n        qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)\n        qc.h(n_qubits - 1)\n        for i in range(n_qubits):\n            if not (target &gt;&gt; i) &amp; 1:\n                qc.x(i)\n\n        <span class="cmt"># --- Diffuser: amplitude amplification ---</span>\n        qc.h(range(n_qubits))\n        qc.x(range(n_qubits))\n        qc.h(n_qubits - 1)\n        qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)\n        qc.h(n_qubits - 1)\n        qc.x(range(n_qubits))\n        qc.h(range(n_qubits))\n\n    qc.measure_all()\n    return AerSimulator().run(qc, shots=1000).result().get_counts()\n\n\nprint(grover(n_qubits=3, target=5))\n<span class="cmt"># {'101': ~1000} — เจอคำตอบได้ทันที</span>`
          },
          { label: "bb84.py", note: "BB84 — Quantum key distribution", code: `<span class="cmt"># Alice ส่ง qubit, Bob วัด → สร้าง key</span>\n<span class="cmt"># ถ้ามีคนดักฟัง (Eve) → error rate สูง → ตรวจเจอ</span>`, realLabel: "bb84_sim.py", real: `import random\nfrom qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\nfrom qiskit_aer import AerSimulator\n\n\ndef bb84(n_bits: int = 20) -&gt; tuple[str, str]:\n    <span class="cmt">"""จำลอง BB84 QKD — สร้าง key ที่ดักฟังไม่ได้"""</span>\n    alice_bits = [random.randint(0, 1) for _ in range(n_bits)]\n    alice_bases = [random.randint(0, 1) for _ in range(n_bits)]\n    bob_bases = [random.randint(0, 1) for _ in range(n_bits)]\n\n    key = []\n    sim = AerSimulator()\n\n    for i in range(n_bits):\n        qc = QuantumCircuit(1, 1)\n        if alice_bits[i]: qc.x(0)\n        if alice_bases[i]: qc.h(0)         <span class="cmt"># X basis</span>\n        if bob_bases[i]: qc.h(0)           <span class="cmt"># Bob วัดแบบเดียวกัน?</span>\n        qc.measure(0, 0)\n        r = sim.run(qc, shots=1).result().get_counts()\n        bob_bit = int(list(r)[0])\n\n        <span class="cmt"># เก็บเฉพาะกรณีใช้ basis เดียวกัน</span>\n        if alice_bases[i] == bob_bases[i]:\n            key.append(bob_bit)\n\n    return <span class="str">""</span>.join(map(str, key)), <span class="str">""</span>.join(map(str, alice_bits))\n\n\nkey_bob, alice_bits = bb84(20)\nprint(f<span class="str">"Key ที่ได้: {key_bob}"</span>)\nprint(f<span class="str">"ความยาว: {len(key_bob)} bits"</span>)`
          }
        ],
        callout: "Grover ไม่ได้เร็วกว่า exponential — แค่ quadratic speedup (O(√N)) แต่ก็สำคัญมาก เช่นค้นหา AES-128 key → 2^64 แทน 2^128",
        hints: [
          "Shor algorithm ทำ RSA-2048 พังได้ถ้ามี quantum computer ~4096 logical qubits",
          "ปัจจุบัน quantum computer ยัง noise เยอะ — ต้อง error correction"
        ],
        techniques: [
          "Quantum speedup: Deutsch (exponential for specific), Grover (√N), Shor (polynomial factoring)",
          "Quantum simulation (chemistry, physics) คือ use case ที่น่าตื่นเต้นที่สุด",
          "QKD (BB84) — quantum cryptography ที่แฮกไม่ได้ตามทฤษฎี"
        ],
        practice: "แก้ Grover ให้หา target=6 (n=3 qubits) — ทำไม iterations ต่างจาก target=5"
      },
      {
        id: "18-3", file: "quantum_apps.py", title: "Quantum Applications จริงในอุตสาหกรรม",
        tagline: "ใช้ quantum แก้ปัญหาอะไรได้จริงวันนี้",
        body: `<p>Quantum computing ยังเด็ก แต่มี use case จริง:</p>
          <ul>
            <li><b>Optimization</b> — QUBO, VQE สำหรับ logistics, portfolio</li>
            <li><b>Chemistry</b> — จำลองโมเลกุล หายาใหม่</li>
            <li><b>ML</b> — QSVM, quantum neural network</li>
            <li><b>Finance</b> — Monte Carlo quantum, portfolio optimization</li>
          </ul>
          <p>Cloud platforms: <b>IBM Quantum</b>, <b>Amazon Braket</b>, <b>Azure Quantum</b>, <b>Google Cirq</b></p>`,
        examples: [
          { label: "vqe.py", note: "VQE — หา ground state ของโมเลกุล", code: `from qiskit.circuit.library import TwoLocal\nfrom qiskit_algorithms import VQE\nfrom qiskit_algorithms.optimizers import SPSA\n\nansatz = TwoLocal(2, <span class="str">"ry"</span>, <span class="str">"cx"</span>, reps=2)\nvqe = VQE(ansatz=ansatz, optimizer=SPSA(maxiter=100))`, realLabel: "portfolio_optimization.py", real: `import numpy as np\nfrom qiskit_optimization import QuadraticProgram\nfrom qiskit_optimization.algorithms import MinimumEigenOptimizer\nfrom qiskit_algorithms import QAOA\nfrom qiskit_algorithms.optimizers import COBYLA\n\n<span class="cmt"># ตัวอย่าง Portfolio Optimization</span>\n<span class="cmt"># เลือกหุ้น 2 จาก 4 ที่ return สูงสุด ความเสี่ยงต่ำสุด</span>\n\nreturns = [0.10, 0.15, 0.07, 0.12]\nrisks = [0.05, 0.08, 0.04, 0.06]\nbudget = 2\n\nqp = QuadraticProgram()\nfor i in range(4):\n    qp.binary_var(name=f<span class="str">"x{i}"</span>)\n\nqp.maximize(\n    linear={f<span class="str">"x{i}"</span>: returns[i] - risks[i] for i in range(4)}\n)\nqp.linear_constraint(\n    linear={f<span class="str">"x{i}"</span>: 1 for i in range(4)},\n    sense=<span class="str">"=="</span>,\n    rhs=budget,\n)\n\nprint(qp.prettyprint())\n\n<span class="cmt"># แก้ด้วย QAOA</span>\noptimizer = COBYLA(maxiter=50)\nqaoa = MinimumEigenOptimizer(\n    QAOA(reps=2, optimizer=optimizer)\n)\nresult = qaoa.solve(qp)\nprint(f<span class="str">"เลือก: {result.x} (ค่า={result.fval:.3f})"</span>)`
          },
          { label: "qml.py", note: "Quantum ML — QSVM", code: `from qiskit_machine_learning.algorithms import QSVC\nfrom qiskit.circuit.library import ZZFeatureMap\n\nfeature_map = ZZFeatureMap(feature_dimension=2)\nqsvc = QSVC(feature_map=feature_map)`, realLabel: "run_on_ibm.py", real: `from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2\nfrom qiskit import QuantumCircuit, transpile\n\n<span class="cmt"># เชื่อมต่อ IBM Quantum (free tier)</span>\nservice = QiskitRuntimeService(\n    channel=<span class="str">"ibm_quantum"</span>,\n    token=<span class="str">"YOUR_IBM_TOKEN"</span>,\n)\n\n<span class="cmt"># ดู backend ที่ใช้ได้</span>\nprint(service.backends())\n\n<span class="cmt"># เลือก backend ที่ queue สั้นสุด</span>\nbackend = service.least_busy(operational=True, simulator=False)\nprint(f<span class="str">"ใช้: {backend.name}"</span>)\n\n<span class="cmt"># สร้าง circuit</span>\nqc = QuantumCircuit(2)\nqc.h(0); qc.cx(0, 1); qc.measure_all()\n\n<span class="cmt"># compile + รัน</span>\nqc_t = transpile(qc, backend=backend, optimization_level=3)\n\nsampler = SamplerV2(backend=backend)\njob = sampler.run([qc_t], shots=1024)\nresult = job.result()\nprint(result)\n\n<span class="cmt"># ใช้ 10 นาที/เดือนฟรี — แต่ queue อาจนานชั่วโมง</span>`
          }
        ],
        callout: "Quantum computing ยังเป็น NISQ era (Noisy Intermediate-Scale) — ยังไม่ general purpose · อย่าเชื่อข่าวว่าทำ RSA พังวันนี้",
        hints: [
          "IBM Quantum / Amazon Braket มี free tier ให้ทดลอง — ลองได้เลย",
          "Qiskit Optimization / ML มี module ready-made — ไม่ต้องเขียน algo เอง"
        ],
        techniques: [
          "Variational algorithms (VQE, QAOA) รันบน NISQ hardware ได้ — ปัจจุบันนิยมสุด",
          "portfolio optimization, logistics, drug discovery — 3 use case จริงที่มีผล",
          "Qiskit Runtime รันบน cloud — qiskit_ibm_runtime สำหรับ quantum จริง"
        ],
        practice: "อธิบายด้วยคำพูดคุณเอง: ทำไม quantum algorithm บางตัวเร็วกว่า classical — ยกตัวอย่าง Grover ที่ O(√N) ทำไมถึงได้"
      }
    ]
  },
  {
    title: "Robotics & ROS", file: "19_robotics",
    lessons: [
      {
        id: "19-1", file: "pid_control.py", title: "PID Controller & Motion Control",
        tagline: "สมองของหุ่นยนต์ — ทำให้มอเตอร์ไปจุดที่ต้องการ",
        body: `<p><b>PID</b> (Proportional-Integral-Derivative) คือ controller ที่ใช้ในหุ่นยนต์ โดรน รถไฟฟ้า — ทุกที่ที่ต้องควบคุมตำแหน่ง/ความเร็ว/อุณหภูมิ</p>
          <p>หลักการ: error = target - current · ผลลัพธ์ = Kp·error + Ki·∑error + Kd·d(error)/dt</p>
          <p>ติดตั้ง: <code>pip install matplotlib</code> (simulate) · ROS2 ใช้ <code>colcon</code></p>`,
        examples: [
          { label: "pid_sim.py", note: "PID ง่าย ๆ เข้าจุดเป้า", code: `class PID:\n    def __init__(self, kp, ki, kd):\n        self.kp, self.ki, self.kd = kp, ki, kd\n        self.integral = 0\n        self.prev = 0\n\n    def step(self, error, dt):\n        self.integral += error * dt\n        deriv = (error - self.prev) / dt\n        self.prev = error\n        return self.kp * error + self.ki * self.integral + self.kd * deriv`, realLabel: "dc_motor_pid.py", real: `import time\nfrom dataclasses import dataclass\n\n\n@dataclass\nclass PIDController:\n    kp: float\n    ki: float\n    kd: float\n    integral_limit: float = 100.0\n\n    def __post_init__(self):\n        self.integral = 0.0\n        self.prev_error = 0.0\n\n    def update(self, setpoint: float, current: float, dt: float) -&gt; float:\n        error = setpoint - current\n        self.integral += error * dt\n        <span class="cmt"># anti-windup</span>\n        self.integral = max(-self.integral_limit,\n                             min(self.integral_limit, self.integral))\n        derivative = (error - self.prev_error) / dt\n        self.prev_error = error\n        return self.kp * error + self.ki * self.integral + self.kd * derivative\n\n\n<span class="cmt"># จำลองมอเตอร์ — เข้าจุด 100</span>\npid = PIDController(kp=2.0, ki=0.5, kd=0.1)\npos, vel = 0.0, 0.0\ntarget = 100.0\ndt = 0.02\n\nfor t in range(200):\n    force = pid.update(target, pos, dt)\n    accel = force - 0.5 * vel  <span class="cmt"># damping</span>\n    vel += accel * dt\n    pos += vel * dt\n\n    if t % 20 == 0:\n        print(f<span class="str">"t={t*dt:.1f}s  pos={pos:7.2f}  err={target-pos:7.2f}"</span>)\n\nprint(f<span class="str">"สุดท้าย: pos={pos:.2f} (target={target})"</span>)`
          },
          { label: "tune_hint.py", note: "วิธี tune PID ให้ได้ผล", code: `<span class="cmt"># 1. Kp อย่างเดียว → เพิ่มจนสั่น แล้วลดครึ่ง</span>\n<span class="cmt"># 2. เพิ่ม Kd → ลด overshoot</span>\n<span class="cmt"># 3. เพิ่ม Ki → ลด steady-state error</span>`, realLabel: "balance_robot.py", real: `import time\n\n\nclass BalanceRobot:\n    <span class="cmt">"""หุ่นยนต์ 2 ล้อทรงตัว — inverted pendulum"""</span>\n    def __init__(self):\n        <span class="cmt"># ค่าที่ tune แล้ว</span>\n        self.Kp_angle = 25.0\n        self.Kd_angle = 1.2\n        self.Kp_pos = 0.8\n        self.Kd_pos = 0.3\n\n        self.prev_angle = 0.0\n        self.prev_pos = 0.0\n        self.integral_pos = 0.0\n\n    def compute_motor(self, angle, target_angle,\n                       pos, target_pos, dt):\n        <span class="cmt"># inner loop: ทรงตัว (เร็วกว่า)</span>\n        angle_err = target_angle - angle\n        angle_deriv = (angle_err - self.prev_angle) / dt\n        angle_output = self.Kp_angle * angle_err + self.Kd_angle * angle_deriv\n        self.prev_angle = angle_err\n\n        <span class="cmt"># outer loop: ตำแหน่ง (ช้ากว่า)</span>\n        pos_err = target_pos - pos\n        self.integral_pos += pos_err * dt\n        pos_deriv = (pos_err - self.prev_pos) / dt\n        pos_output = (self.Kp_pos * pos_err +\n                       0.05 * self.integral_pos +\n                       self.Kd_pos * pos_deriv)\n        self.prev_pos = pos_err\n\n        <span class="cmt"># ผสม signal → สั่งมอเตอร์ซ้าย/ขวา</span>\n        left  = angle_output + pos_output\n        right = angle_output - pos_output\n        return left, right\n\n\nrobot = BalanceRobot()\nprint(robot.compute_motor(\n    angle=0.15, target_angle=0,\n    pos=0.0, target_pos=0.5,\n    dt=0.01,\n))`
          }
        ],
        callout: "ลำดับการ tune PID: เพิ่ม Kp → เพิ่ม Kd (ลด overshoot) → เพิ่ม Ki (ลด steady-state error) · อย่าเพิ่มทุกตัวพร้อมกัน ไม่งั้น tune ไม่ได้",
        hints: [
          "simulate PID ใน Python ก่อน tune บน hardware จริง — ประหยัดเวลา",
          "Anti-windup (clip integral) จำเป็นเมื่อ output จำกัด (มอเตอร์แรงเต็มที่)"
        ],
        techniques: [
          "Cascade PID (nested) — inner loop เร็ว (angle) + outer loop ช้า (position) — ใช้ในโดรนและ balance robot",
          "Sample rate ต้องเร็วกว่า dynamics 10 เท่า — มอเตอร์ 100Hz → sample ≥ 1kHz",
          "matplotlib แสดงกราฟ step response — tune ง่ายขึ้นเยอะ"
        ],
        practice: "ปรับ Kp=1, 5, 10 (Ki=Kd=0) แล้วสังเกต — Kp เท่าไหร่ที่ overshoot น้อยสุดแต่ยังเร็ว"
      },
      {
        id: "19-2", file: "ros2_basics.py", title: "ROS2 — Robot Operating System",
        tagline: "Framework มาตรฐานวงการหุ่นยนต์ — NASA, Boston Dynamics ใช้",
        body: `<p><b>ROS2</b> ไม่ใช่ OS จริง — เป็น middleware ให้ส่วนต่าง ๆ ของหุ่นยนต์คุยกัน (sensor, motor, planner)</p>
          <p>แนวคิดหลัก: <b>Node</b> (โปรแกรมเล็ก), <b>Topic</b> (pub/sub), <b>Service</b> (request/response), <b>Action</b> (งานยาว)</p>
          <p>ติดตั้ง: <code>sudo apt install ros-humble-desktop</code> (Ubuntu 22.04) · Windows/Mac ใช้ Docker</p>`,
        examples: [
          { label: "publisher.py", note: "Node ที่ publish ข้อมูล", code: `import rclpy\nfrom rclpy.node import Node\nfrom std_msgs.msg import String\n\nclass Talker(Node):\n    def __init__(self):\n        super().__init__(<span class="str">"talker"</span>)\n        self.pub = self.create_publisher(String, <span class="str">"chatter"</span>, 10)\n        self.timer = self.create_timer(1.0, self.tick)\n\n    def tick(self):\n        msg = String()\n        msg.data = <span class="str">"hello"</span>\n        self.pub.publish(msg)`, realLabel: "ros2_sensor_node.py", real: `import rclpy\nfrom rclpy.node import Node\nfrom sensor_msgs.msg import LaserScan, Imu\nfrom geometry_msgs.msg import Twist\nfrom rclpy.qos import QoSProfile, ReliabilityPolicy\n\n\nclass ObstacleAvoider(Node):\n    def __init__(self):\n        super().__init__(<span class="str">"obstacle_avoider"</span>)\n\n        qos = QoSProfile(depth=10, reliability=ReliabilityPolicy.BEST_EFFORT)\n        self.create_subscription(LaserScan, <span class="str">"/scan"</span>, self.on_scan, qos)\n        self.create_subscription(Imu, <span class="str">"/imu"</span>, self.on_imu, 10)\n\n        self.cmd_pub = self.create_publisher(Twist, <span class="str">"/cmd_vel"</span>, 10)\n\n        self.safe_distance = 0.5  <span class="cmt"># meters</span>\n        self.state = <span class="str">"FORWARD"</span>\n        self.create_timer(0.1, self.control_loop)\n\n    def on_scan(self, msg: LaserScan):\n        front = msg.ranges[len(msg.ranges)//2]\n        if front &lt; self.safe_distance:\n            self.state = <span class="str">"AVOID"</span>\n        else:\n            self.state = <span class="str">"FORWARD"</span>\n\n    def on_imu(self, msg: Imu):\n        self.get_logger().debug(f<span class="str">"yaw={msg.angular_velocity.z:.2f}"</span>)\n\n    def control_loop(self):\n        cmd = Twist()\n        if self.state == <span class="str">"FORWARD"</span>:\n            cmd.linear.x = 0.3\n            cmd.angular.z = 0.0\n        else:\n            cmd.linear.x = 0.0\n            cmd.angular.z = 0.5  <span class="cmt"># หมุนหนี</span>\n        self.cmd_pub.publish(cmd)\n\n\ndef main():\n    rclpy.init()\n    node = ObstacleAvoider()\n    try:\n        rclpy.spin(node)\n    finally:\n        node.destroy_node()\n        rclpy.shutdown()\n\n\nif __name__ == <span class="str">"__main__"</span>:\n    main()`
          },
          { label: "launch.py", note: "Launch file — เปิดหลาย node พร้อมกัน", code: `from launch import LaunchDescription\nfrom launch_ros.actions import Node\n\ndef generate_launch_description():\n    return LaunchDescription([\n        Node(package=<span class="str">"my_robot"</span>, executable=<span class="str">"talker"</span>),\n        Node(package=<span class="str">"my_robot"</span>, executable=<span class="str">"listener"</span>),\n    ])`, realLabel: "sim_turtlebot.py", real: `<span class="cmt"># launch file: simulation TurtleBot3 + navigation</span>\nfrom launch import LaunchDescription\nfrom launch.actions import IncludeLaunchDescription, ExecuteProcess\nfrom launch.launch_description_sources import PythonLaunchDescriptionSource\nfrom launch_ros.actions import Node\nfrom ament_index_python.packages import get_package_share_directory\nimport os\n\n\ndef generate_launch_description():\n    nav2_dir = get_package_share_directory(<span class="str">"nav2_bringup"</span>)\n\n    <span class="cmt"># 1. เปิด Gazebo + TurtleBot3</span>\n    sim = ExecuteProcess(\n        cmd=[<span class="str">"ros2"</span>, <span class="str">"launch"</span>, <span class="str">"turtlebot3_gazebo"</span>,\n             <span class="str">"turtlebot3_world.launch.py"</span>],\n        output=<span class="str">"screen"</span>,\n    )\n\n    <span class="cmt"># 2. เปิด Navigation2 stack</span>\n    nav = IncludeLaunchDescription(\n        PythonLaunchDescriptionSource(\n            os.path.join(nav2_dir, <span class="str">"launch"</span>, <span class="str">"bringup_launch.py"</span>)\n        ),\n        launch_arguments={<span class="str">"use_sim_time"</span>: <span class="str">"true"</span>}.items(),\n    )\n\n    <span class="cmt"># 3. เปิด RViz ดู visualization</span>\n    rviz = Node(\n        package=<span class="str">"rviz2"</span>, executable=<span class="str">"rviz2"</span>,\n        name=<span class="str">"rviz2"</span>, output=<span class="str">"screen"</span>,\n    )\n\n    return LaunchDescription([sim, nav, rviz])`
          }
        ],
        callout: "ROS2 ต่างจาก ROS1 ตรงที่ใช้ DDS middleware — รองรับ multi-robot, real-time, security · ถ้าเริ่มใหม่เลือก ROS2 (Humble/Iron)",
        hints: [
          "ros2 topic list / ros2 node list / ros2 topic echo /scan — คำสั่ง debug ต้องรู้",
          "ใช้ Gazebo (sim) หรือ Isaac Sim (NVIDIA) ทดสอบก่อน hardware จริง"
        ],
        techniques: [
          "Topic = streaming data (continuous), Service = request/response (fast), Action = งานยาว (feedback ได้)",
          "QoS policy กำหนด reliability/latency — เลือกตามงาน (sensor ใช้ BEST_EFFORT, command ใช้ RELIABLE)",
          "colcon build + source install/setup.bash — build workspace ROS2"
        ],
        practice: "อธิบาย 3 ความต่างระหว่าง Topic / Service / Action — พร้อมยกตัวอย่างงานหุ่นยนต์ที่ใช้แต่ละแบบ 1 งาน"
      },
      {
        id: "19-3", file: "vision_nav.py", title: "Computer Vision + Path Planning สำหรับหุ่นยนต์",
        tagline: "ให้หุ่นยนต์ 'เห็น' และ 'ตัดสินใจ' ได้",
        body: `<p>หุ่นยนต์ที่ฉลาดต้อง: <b>เห็น</b> (computer vision) → <b>รู้ว่าตัวเองอยู่ไหน</b> (SLAM) → <b>วางแผน</b> (path planning)</p>
          <p>ติดตั้ง: <code>pip install opencv-python numpy scipy</code></p>`,
        examples: [
          { label: "detect_color.py", note: "ตรวจจับสีด้วย OpenCV", code: `import cv2\nimport numpy as np\n\ncap = cv2.VideoCapture(0)\nwhile True:\n    ok, frame = cap.read()\n    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)\n    mask = cv2.inRange(hsv, (0, 100, 100), (10, 255, 255))\n    cv2.imshow(<span class="str">"mask"</span>, mask)\n    if cv2.waitKey(1) == 27: break`, realLabel: "lane_following.py", real: `import cv2\nimport numpy as np\n\n\nclass LaneFollower:\n    <span class="cmt">"""ตามเส้นถนนสีขาว — สำหรับหุ่นยนต์ตามเส้น"""</span>\n    def __init__(self, img_width=640):\n        self.w = img_width\n        self.prev_error = 0\n\n    def detect_line(self, frame) -&gt; float:\n        h, w = frame.shape[:2]\n\n        <span class="cmt"># 1. crop ROI (ครึ่งล่างของภาพ)</span>\n        roi = frame[h//2:, :]\n\n        <span class="cmt"># 2. grayscale + threshold</span>\n        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)\n        _, mask = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)\n\n        <span class="cmt"># 3. หา centroid ของเส้น</span>\n        M = cv2.moments(mask)\n        if M[<span class="str">"m00"</span>] == 0:\n            return self.prev_error  <span class="cmt"># ไม่เจอเส้น ใช้ค่าเก่า</span>\n\n        cx = int(M[<span class="str">"m10"</span>] / M[<span class="str">"m00"</span>])\n        error = (cx - w/2) / (w/2)  <span class="cmt"># -1 ถึง 1</span>\n        self.prev_error = error\n        return error\n\n    def to_cmd(self, error: float) -&gt; tuple[float, float]:\n        <span class="cmt"># linear speed ลดลงเมื่อ error สูง</span>\n        linear = 0.3 * (1.0 - abs(error) * 0.7)\n        angular = -error * 1.5\n        return linear, angular\n\n\nfollower = LaneFollower()\nprint(follower.to_cmd(-0.5))  <span class="cmt"># (0.195, 0.75)</span>\nprint(follower.to_cmd(0.2))   <span class="cmt"># (0.258, -0.3)</span>`
          },
          { label: "astar.py", note: "A* path planning", code: `import heapq\n\ndef astar(start, goal, h, neighbors):\n    open_set = [(0, start)]\n    came, g = {}, {start: 0}\n    while open_set:\n        _, cur = heapq.heappop(open_set)\n        if cur == goal: break\n        for n, w in neighbors(cur):\n            ng = g[cur] + w\n            if ng &lt; g.get(n, 1e9):\n                g[n] = ng\n                came[n] = cur\n                heapq.heappush(open_set, (ng + h(n, goal), n))\n    return came`, realLabel: "grid_astar.py", real: `import heapq\nfrom typing import Iterator\n\n\nGrid = list[list[int]]  <span class="cmt"># 0 = free, 1 = obstacle</span>\nPoint = tuple[int, int]\n\n\ndef neighbors(grid: Grid, p: Point) -&gt; Iterator[tuple[Point, float]]:\n    x, y = p\n    for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:\n        nx, ny = x + dx, y + dy\n        if 0 &lt;= ny &lt; len(grid) and 0 &lt;= nx &lt; len(grid[0]):\n            if grid[ny][nx] == 0:\n                yield (nx, ny), 1.0\n\n\ndef manhattan(a: Point, b: Point) -&gt; float:\n    return abs(a[0]-b[0]) + abs(a[1]-b[1])\n\n\ndef astar(grid: Grid, start: Point, goal: Point) -&gt; list[Point] | None:\n    open_set = [(0, start)]\n    came_from: dict[Point, Point] = {}\n    g_score: dict[Point, float] = {start: 0}\n\n    while open_set:\n        _, cur = heapq.heappop(open_set)\n\n        if cur == goal:\n            <span class="cmt"># reconstruct path</span>\n            path = [cur]\n            while cur in came_from:\n                cur = came_from[cur]\n                path.append(cur)\n            return path[::-1]\n\n        for nxt, cost in neighbors(grid, cur):\n            tentative = g_score[cur] + cost\n            if tentative &lt; g_score.get(nxt, float(<span class="str">"inf"</span>)):\n                came_from[nxt] = cur\n                g_score[nxt] = tentative\n                f = tentative + manhattan(nxt, goal)\n                heapq.heappush(open_set, (f, nxt))\n    return None\n\n\ngrid = [\n    [0, 0, 0, 0, 1, 0],\n    [1, 1, 0, 1, 1, 0],\n    [0, 0, 0, 0, 0, 0],\n    [0, 1, 1, 1, 1, 0],\n    [0, 0, 0, 0, 0, 0],\n]\n\npath = astar(grid, (0, 0), (5, 4))\nprint(f<span class="str">"Path length: {len(path) if path else 'no path'}"</span>)\nfor y in range(len(grid)):\n    row = <span class="str">""</span>\n    for x in range(len(grid[0])):\n        if (x, y) in (path or []):\n            row += <span class="str">"● "</span>\n        elif grid[y][x]:\n            row += <span class="str">"█ "</span>\n        else:\n            row += <span class="str">". "</span>\n    print(row)`
          }
        ],
        callout: "A* ต้องมี heuristic ที่ admissible (ห้าม overestimate) — Manhattan สำหรับ 4 ทิศ, Euclidean สำหรับ 8 ทิศ · ไม่งั้นจะไม่ได้ path ที่สั้นสุด",
        hints: [
          "OpenCV ใช้ BGR ไม่ใช่ RGB — cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) ก่อนแสดงผล matplotlib",
          "RRT* และ D* Lite สำหรับ dynamic environment — A* เหมาะกับ static grid"
        ],
        techniques: [
          "SLAM (Simultaneous Localization and Mapping) — ใช้ slam_toolbox ใน ROS2 สำหรับหุ่นยนต์จริง",
          "Path planning: A* (grid), RRT (continuous), Nav2 (full stack ROS2)",
          "Kalman filter + IMU + wheel odometry = pose estimation ที่แม่น"
        ],
        practice: "อธิบาย 3 ขั้นตอน: กล้องเห็นภาพ → หา centroid ของเส้น → แปลงเป็นคำสั่ง cmd_vel — เขียน pseudo code 3 บรรทัด"
      }
    ]
  },
  {
    title: "Bioinformatics", file: "20_bio",
    lessons: [
      {
        id: "20-1", file: "biopython_basic.py", title: "BioPython — อ่าน DNA/RNA/Protein",
        tagline: "ใช้ Python ถอดรหัสพันธุกรรม — วิทยาศาสตร์ยุคใหม่",
        body: `<p><b>Bioinformatics</b> = ใช้โค้ดวิเคราะห์ข้อมูลชีววิทยา — DNA (A/T/G/C), RNA, protein</p>
          <p><b>BioPython</b> คือ library มาตรฐานสำหรับอ่าน FASTA/GenBank, แปลง DNA→Protein, ค้นหา motif, BLAST</p>
          <p>ติดตั้ง: <code>pip install biopython</code></p>`,
        examples: [
          { label: "dna_basic.py", note: "อ่านและแปลง DNA sequence", code: `from Bio.Seq import Seq\n\ndna = Seq(<span class="str">"ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"</span>)\nprint(dna)\nprint(dna.reverse_complement())\nprint(dna.transcribe())  <span class="cmt"># → RNA</span>\nprint(dna.translate())   <span class="cmt"># → Protein</span>`, realLabel: "gc_content.py", real: `from Bio import SeqIO\nfrom pathlib import Path\n\n\ndef gc_content(seq: str) -&gt; float:\n    <span class="cmt">"""คำนวณ %GC — DNA ที่ GC สูงจะเสถียรกว่า"""</span>\n    seq = seq.upper()\n    if not seq: return 0.0\n    gc = sum(1 for base in seq if base in <span class="str">"GC"</span>)\n    return 100.0 * gc / len(seq)\n\n\n<span class="cmt"># อ่านไฟล์ FASTA (บันทึก sequence มาตรฐาน)</span>\nfasta = <span class="str">"""&gt;seq1 sample A\nATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG\n&gt;seq2 sample B\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT\n"""</span>\nPath(<span class="str">"sample.fasta"</span>).write_text(fasta)\n\nfor record in SeqIO.parse(<span class="str">"sample.fasta"</span>, <span class="str">"fasta"</span>):\n    seq = str(record.seq)\n    print(f<span class="str">"{record.id:6} len={len(seq):3}  GC={gc_content(seq):.1f}%"</span>)\n    print(f<span class="str">"     คำอธิบาย: {record.description}"</span>)`
          },
          { label: "motif.py", note: "ค้นหา motif ใน DNA", code: `from Bio.Seq import Seq\n\nseq = Seq(<span class="str">"ATGGCCATTGTAATGGGCCGCTGA"</span>)\n<span class="cmt"># หา TATA box</span>\nprint(seq.find(<span class="str">"TATAAA"</span>))`, realLabel: "orf_finder.py", real: `from Bio.Seq import Seq\n\n\ndef find_orfs(seq: Seq, min_len: int = 30) -&gt; list[tuple[int, int, Seq]]:\n    <span class="cmt">"""หา Open Reading Frames — ยีนที่เป็นไปได้"""</span>\n    orfs = []\n    for frame in range(3):\n        i = frame\n        while i &lt; len(seq) - 3:\n            codon = seq[i:i+3]\n            if codon == <span class="str">"ATG"</span>:  <span class="cmt"># start codon</span>\n                j = i\n                while j &lt; len(seq) - 3:\n                    if seq[j:j+3] in (<span class="str">"TAA"</span>, <span class="str">"TAG"</span>, <span class="str">"TGA"</span>):\n                        if j - i &gt;= min_len:\n                            orfs.append((i, j+3, seq[i:j+3]))\n                        break\n                    j += 3\n            i += 3\n    return orfs\n\n\n<span class="cmt"># ตัวอย่าง DNA สั้น ๆ (มี ATG ... TAA)</span>\ndna = Seq(<span class="str">"ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAGCCCTAA"</span>)\n\nfor start, end, orf in find_orfs(dna):\n    protein = orf.translate()\n    print(f<span class="str">"[{start:3}-{end:3}] {len(orf):3} bp → {protein}"</span>)`
          }
        ],
        callout: "DNA เส้นคู่ antiparallel — 5'→3' หนึ่งเส้น 3'→5' อีกเส้น · reverse_complement() จำเป็นเวลาเปรียบเทียบ sequence จากคนละสาย",
        hints: [
          "Seq object ของ BioPython มี method ครบ: translate, transcribe, reverse_complement, find, split",
          "reading frame มี 3 แบบ (เริ่มที่ตำแหน่ง 0, 1, 2) — จริง ๆ ต้องดู 6 frames (รวม reverse)"
        ],
        techniques: [
          "FASTA format: >id description\\nSEQUENCE — มาตรฐานสากล",
          "Codon → amino acid: ตาราง genetic code 64 entries — BioPython มีให้แล้ว",
          "GC content ใช้ทำนาย melting temperature (Tm) ของ primer"
        ],
        practice: "เขียนฟังก์ชัน complement_strict(seq) ที่ให้ A↔T, G↔C (ไม่ reverse) — ทดสอบกับ DNA 10 bp"
      },
      {
        id: "20-2", file: "protein_structure.py", title: "Protein, Alignment & BLAST",
        tagline: "เปรียบเทียบ sequence ระดับมืออาชีพ",
        body: `<p><b>Alignment</b> คือการเทียบ sequence ตั้งแต่ 2 ตัวขึ้นไป — ดูว่าคล้ายกันแค่ไหน วิวัฒนาการมาจากบรรพบุรุษเดียวกันไหม</p>
          <p>เครื่องมือ: <b>BLAST</b> (NCBI), <b>Clustal</b>, <b>MUSCLE</b> — แต่ละตัวเลือกได้ตามงาน</p>`,
        examples: [
          { label: "pairwise.py", note: "Pairwise alignment 2 sequence", code: `from Bio import Align\nfrom Bio.Align import substitution_matrices\n\naligner = Align.PairwiseAligner()\naligner.substitution_matrix = substitution_matrices.load(<span class="str">"BLOSUM62"</span>)\naligner.open_gap_score = -10\naligner.extend_gap_score = -0.5\n\na = <span class="str">"HEAGAWGHEE"</span>\nb = <span class="str">"PAWHEAE"</span>\nprint(aligner.align(a, b)[0])`, realLabel: "blast_search.py", real: `from Bio.Blast import NCBIWWW, NCBIXML\nfrom Bio.Seq import Seq\n\n\ndef blast_search(sequence: str, program: str = <span class="str">"blastn"</span>,\n                  database: str = <span class="str">"nt"</span>, max_hits: int = 5):\n    <span class="cmt">"""ส่ง sequence ไปหาใน NCBI ว่าเหมือนอะไร"""</span>\n    result_handle = NCBIWWW.qblast(program, database, sequence)\n\n    hits = []\n    for record in NCBIXML.parse(result_handle):\n        for alignment in record.alignments[:max_hits]:\n            for hsp in alignment.hsps:\n                hits.append({\n                    <span class="str">"title"</span>: alignment.title[:80],\n                    <span class="str">"length"</span>: alignment.length,\n                    <span class="str">"score"</span>: hsp.score,\n                    <span class="str">"e_value"</span>: hsp.expect,\n                    <span class="str">"identity"</span>: f<span class="str">"{hsp.identities}/{hsp.align_length}"</span>,\n                })\n    return hits\n\n\n<span class="cmt"># ตัวอย่าง (sequence สั้น ๆ — ปกติต้อง &gt;= 20 bp)</span>\nseq = <span class="str">"ATGGCCTACCGTTAA"</span>\ntry:\n    hits = blast_search(seq, max_hits=3)\n    for h in hits:\n        print(f<span class="str">"E-value: {h['e_value']:.2e}  |  {h['title']}"</span>)\nexcept Exception as e:\n    print(f<span class="str">"BLAST error (อาจไม่มี internet): {e}"</span>)`
          },
          { label: "msa.py", note: "Multiple Sequence Alignment", code: `from Bio import AlignIO\n\n<span class="cmt"># ClustalW format</span>\nalignment = AlignIO.read(<span class="str">"msa.aln"</span>, <span class="str">"clustal"</span>)\nfor rec in alignment:\n    print(rec.id, rec.seq)`, realLabel: "distance_tree.py", real: `import io\nfrom Bio import AlignIO\nfrom Bio.Phylo.TreeConstruction import (\n    DistanceCalculator, DistanceTreeConstructor,\n)\nfrom Bio.Phylo import draw\n\n<span class="cmt"># สร้าง MSA จาก format Clustal</span>\nmsa_text = <span class="str">"""CLUSTAL W\n\nseq1  ATGGCCATTGTAATGGGCCGCTGA\nseq2  ATGGCC---GTAATGGGCCGCTGA\nseq3  ATGGCCATTGTAATGGGCCGCTGA\n"""</span>\n\nalignment = AlignIO.read(io.StringIO(msa_text), <span class="str">"clustal"</span>)\n\n<span class="cmt"># คำนวณ distance matrix (identity)</span>\ncalculator = DistanceCalculator(<span class="str">"identity"</span>)\ndm = calculator.get_distance(alignment)\nprint(dm)\n\n<span class="cmt"># สร้าง phylogenetic tree (UPGMA)</span>\nconstructor = DistanceTreeConstructor(calculator, <span class="str">"upgma"</span>)\ntree = constructor.build_tree(alignment)\ntree.rooted = True\nprint(<span class="str">"\\nTree:"</span>)\nprint(tree)\n\n<span class="cmt"># ส่งออกเป็น Newick format</span>\nfrom Bio import Phylo\nPhylo.write(tree, <span class="str">"tree.nwk"</span>, <span class="str">"newick"</span>)`
          }
        ],
        callout: "E-value ยิ่งน้อยยิ่งดี — &lt;1e-5 ถือว่ามีนัยสำคัญ · แต่อย่าลืมดู identity coverage ด้วย ไม่ใช่แค่ E-value",
        hints: [
          "BLOSUM62 สำหรับ protein, NUC.4.4 สำหรับ DNA — เลือก matrix ให้เหมาะกับงาน",
          "BLAST online ผ่าน NCBIWWW ช้า — สำหรับ production ใช้ local BLAST+ เร็วกว่า 100 เท่า"
        ],
        techniques: [
          "Global alignment (Needleman-Wunsch) — เทียบเต็มทั้ง 2 sequence",
          "Local alignment (Smith-Waterman) — เทียบแค่ส่วนที่คล้าย (BLAST ใช้ตัวนี้)",
          "Phylogenetic tree: UPGMA (simple) หรือ Neighbor-Joining (เป็นที่นิยม)"
        ],
        practice: "เปรียบเทียบ DNA 2 sequence: 'ATGGCCATTGTAAT' vs 'ATGGCCATTGTAAT' (เหมือน) และ vs 'ATGGCC-ATTGTAAT' (มี gap) — คำนวณ %identity"
      },
      {
        id: "20-3", file: "genomics_pipeline.py", title: "Genomics Pipeline — วิเคราะห์ข้อมูลจริง",
        tagline: "Pipeline ที่ใช้ในงานวิจัยจริง — อ่าน FASTQ, QC, map reads",
        body: `<p>งาน genomics จริงมี pipeline:</p>
          <ol>
            <li><b>FASTQ</b> — อ่าน raw reads จาก sequencer</li>
            <li><b>QC</b> — ตัด adapter, กรองคุณภาพ</li>
            <li><b>Alignment</b> — map reads กับ reference genome (BWA, Bowtie2)</li>
            <li><b>Variant calling</b> — หา SNP, indel (GATK, bcftools)</li>
            <li><b>Annotation</b> — บอกว่าอยู่ยีนไหน (ANNOVAR, VEP)</li>
          </ol>
          <p>Python มักใช้เป็น orchestrator เรียกเครื่องมือ Linux + parse output</p>`,
        examples: [
          { label: "fastq_basic.py", note: "อ่านไฟล์ FASTQ", code: `from Bio import SeqIO\n\nfor rec in SeqIO.parse(<span class="str">"reads.fastq"</span>, <span class="str">"fastq"</span>):\n    print(rec.id, len(rec.seq), rec.letter_annotations[<span class="str">"phred_quality"</span>][:5])`, realLabel: "qc_pipeline.py", real: `import subprocess\nfrom pathlib import Path\nfrom Bio import SeqIO\nfrom statistics import mean\n\n\ndef qc_fastq(path: Path, min_qual: int = 20):\n    <span class="cmt">"""QC ง่าย ๆ — กรอง reads คุณภาพต่ำ"""</span>\n    keep_path = path.with_suffix(<span class="str">".filtered.fastq"</span>)\n\n    total = passed = 0\n    quality_sum = 0\n    with path.open() as fin, keep_path.open(<span class="str">"w"</span>) as fout:\n        for rec in SeqIO.parse(fin, <span class="str">"fastq"</span>):\n            total += 1\n            quals = rec.letter_annotations[<span class="str">"phred_quality"</span>]\n            if mean(quals) &gt;= min_qual:\n                passed += 1\n                SeqIO.write(rec, fout, <span class="str">"fastq"</span>)\n\n    return {\n        <span class="str">"total"</span>: total,\n        <span class="str">"passed"</span>: passed,\n        <span class="str">"pass_rate"</span>: f<span class="str">"{100*passed/max(total,1):.1f}%"</span>,\n    }\n\n\n<span class="cmt"># ตัวอย่าง — ส่งคำสั่งให้ BWA (external tool)</span>\ndef align_to_reference(reads: Path, reference: Path, output: Path):\n    <span class="cmt"># bwa mem ref.fa reads.fq &gt; out.sam</span>\n    cmd = [<span class="str">"bwa"</span>, <span class="str">"mem"</span>, str(reference), str(reads)]\n    with output.open(<span class="str">"w"</span>) as fout:\n        subprocess.run(cmd, stdout=fout, check=True)\n\n\nprint(<span class="str">"Pipeline orchestrate BWA + QC + GATK"</span>)\n<span class="cmt"># ในงานจริงมี workflow manager: Snakemake, Nextflow</span>`
          },
          { label: "variant.py", note: "หาความต่างจาก reference", code: `from Bio import Align\n\naligner = Align.PairwiseAligner()\nref = <span class="str">"ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGA"</span>\nsample = <span class="str">"ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGAT"</span>\n<span class="cmt"># หา SNP</span>`, realLabel: "call_snps.py", real: `from pathlib import Path\nfrom collections import defaultdict\n\n\ndef parse_simple_sam(sam_path: Path, ref: str):\n    <span class="cmt">"""Parse SAM จริง — นับ allele ที่แต่ละตำแหน่ง"""</span>\n    pileup: dict[int, dict[str, int]] = defaultdict(lambda: defaultdict(int))\n\n    with sam_path.open() as f:\n        for line in f:\n            if line.startswith(<span class="str">"@"</span>): continue\n            parts = line.split(<span class="str">"\\t"</span>)\n            pos = int(parts[3]) - 1  <span class="cmt"># 0-based</span>\n            seq = parts[9]\n            cigar = parts[5]\n\n            <span class="cmt"># (กรณี simplified: assume M-cigar อ่านง่าย)</span>\n            if cigar == f<span class="str">"{len(seq)}M"</span>:\n                for i, base in enumerate(seq):\n                    pileup[pos + i][base] += 1\n\n    <span class="cmt"># หา SNP: ตำแหน่งที่ allele ไม่ตรงกับ ref</span>\n    snps = []\n    for pos, alleles in pileup.items():\n        ref_base = ref[pos]\n        total = sum(alleles.values())\n        for base, count in alleles.items():\n            if base != ref_base and count / total &gt;= 0.2:  <span class="cmt"># &gt;20%</span>\n                snps.append({\n                    <span class="str">"pos"</span>: pos + 1,\n                    <span class="str">"ref"</span>: ref_base,\n                    <span class="str">"alt"</span>: base,\n                    <span class="str">"freq"</span>: f<span class="str">"{100*count/total:.1f}%"</span>,\n                })\n    return snps\n\n\n<span class="cmt"># ตัวอย่าง usage (ต้องมีไฟล์ .sam)</span>\nprint(<span class="str">"Parse SAM → หา SNP → filter &gt;20% allele freq"</span>)\nprint(<span class="str">"ในงานจริงใช้ bcftools mpileup + call — แม่นกว่า custom code"</span>)`
          }
        ],
        callout: "ในงานวิจัยจริงอย่าเขียน variant caller เอง — ใช้ GATK, bcftools, FreeBayes ที่ผ่านการ validate แล้ว · Python ใช้ orchestrate + parse",
        hints: [
          "Workflow managers: Snakemake, Nextflow, WDL — จัดการ pipeline ที่มี 100+ ขั้นตอน",
          "Docker/Singularity จำเป็นสำหรับ reproducibility — containerize ทุก tool"
        ],
        techniques: [
          "SAM/BAM = format alignment มาตรฐาน · VCF = variant call format",
          "FASTQ → BAM → VCF → Annotated VCF คือ pipeline มาตรฐาน",
          "Quality score (Phred): Q20 = 1% error, Q30 = 0.1% error, Q40 = 0.01% error"
        ],
        practice: "อ่าน FASTQ record — คำนวณค่าเฉลี่ย Phred quality ของ read แรกในไฟล์ แล้วบอกว่าผ่าน Q30 หรือไม่"
      }
    ]
  },
  {
    title: "Audio & DSP", file: "21_audio",
    lessons: [
      {
        id: "21-1", file: "audio_basics.py", title: "อ่าน-เขียนเสียง & สเปกตรัม",
        tagline: "โปรแกรมจัดการเสียง — จาก waveform สู่ frequency",
        body: `<p><b>Audio</b> ในคอมคือ array ของตัวเลข — sample rate (Hz) × ความยาว = จำนวน sample</p>
          <p>CD quality = 44100 Hz, 16-bit · Podcast = 22050 Hz, mono</p>
          <p>ติดตั้ง: <code>pip install soundfile numpy scipy matplotlib</code></p>`,
        examples: [
          { label: "read_wav.py", note: "อ่านไฟล์เสียงเป็น array", code: `import soundfile as sf\n\ndata, sr = sf.read(<span class="str">"song.wav"</span>)\nprint(data.shape, sr)\n<span class="cmt"># (220500,) 44100 → 5 วินาที mono</span>`, realLabel: "audio_stats.py", real: `import soundfile as sf\nimport numpy as np\nfrom pathlib import Path\n\n\ndef audio_info(path: str) -&gt; dict:\n    data, sr = sf.read(path)\n\n    <span class="cmt"># ถ้า stereo → shape (n, 2)</span>\n    duration = len(data) / sr\n    peak_db = 20 * np.log10(np.max(np.abs(data)) + 1e-9)\n    rms_db = 20 * np.log10(np.sqrt(np.mean(data**2)) + 1e-9)\n\n    return {\n        <span class="str">"sample_rate"</span>: sr,\n        <span class="str">"duration_s"</span>: round(duration, 2),\n        <span class="str">"channels"</span>: 1 if data.ndim == 1 else data.shape[1],\n        <span class="str">"peak_dB"</span>: round(peak_db, 1),\n        <span class="str">"rms_dB"</span>: round(rms_db, 1),\n        <span class="str">"clipping"</span>: bool(np.max(np.abs(data)) &gt;= 0.999),\n    }\n\n\n<span class="cmt"># สร้าง sine wave 440 Hz (A4) เพื่อทดสอบ</span>\nsr = 22050\nt = np.linspace(0, 1, sr, endpoint=False)\nsignal = 0.5 * np.sin(2 * np.pi * 440 * t)\nsf.write(<span class="str">"tone.wav"</span>, signal, sr)\nprint(audio_info(<span class="str">"tone.wav"</span>))`
          },
          { label: "spectrum.py", note: "FFT — ดูสเปกตรัมความถี่", code: `import numpy as np\nfrom scipy.fft import rfft, rfftfreq\n\nfreqs = rfftfreq(len(signal), 1/sr)\nmagnitude = np.abs(rfft(signal))\npeak = freqs[np.argmax(magnitude)]\nprint(f<span class="str">"ความถี่สูงสุด: {peak} Hz"</span>)`, realLabel: "spectrogram.py", real: `import numpy as np\nimport soundfile as sf\nfrom scipy import signal as sp\nimport matplotlib.pyplot as plt\n\n<span class="cmt"># อ่านไฟล์</span>\ndata, sr = sf.read(<span class="str">"song.wav"</span>)\nif data.ndim &gt; 1:\n    data = data.mean(axis=1)  <span class="cmt"># mix stereo → mono</span>\n\n<span class="cmt"># Spectrogram — FFT แบบ sliding window</span>\nf, t, Sxx = sp.spectrogram(\n    data, sr,\n    window=<span class="str">"hann"</span>,\n    nperseg=2048,\n    noverlap=1024,\n)\n\n<span class="cmt"># แปลงเป็น dB</span>\nSxx_db = 10 * np.log10(Sxx + 1e-12)\n\nplt.figure(figsize=(12, 5))\nplt.pcolormesh(t, f, Sxx_db, shading=<span class="str">"gouraud"</span>, cmap=<span class="str">"magma"</span>)\nplt.ylabel(<span class="str">"Frequency (Hz)"</span>)\nplt.xlabel(<span class="str">"Time (s)"</span>)\nplt.title(<span class="str">"Spectrogram"</span>)\nplt.ylim(0, 8000)  <span class="cmt"># ดูถึง 8kHz</span>\nplt.colorbar(label=<span class="str">"dB"</span>)\nplt.savefig(<span class="str">"spectrogram.png"</span>, dpi=150, bbox_inches=<span class="str">"tight"</span>)\n\n<span class="cmt"># Musical note detection</span>\nA4 = 440.0\ndef hz_to_note(freq):\n    if freq &lt;= 0: return <span class="str">"?"</span>\n    n = round(12 * np.log2(freq / A4))\n    notes = [<span class="str">"A"</span>,<span class="str">"A#"</span>,<span class="str">"B"</span>,<span class="str">"C"</span>,<span class="str">"C#"</span>,<span class="str">"D"</span>,<span class="str">"D#"</span>,<span class="str">"E"</span>,<span class="str">"F"</span>,<span class="str">"F#"</span>,<span class="str">"G"</span>,<span class="str">"G#"</span>]\n    return notes[n % 12] + str(4 + (n // 12))\n\nprint(hz_to_note(440))    <span class="cmt"># A4</span>\nprint(hz_to_note(261.63)) <span class="cmt"># C4</span>`
          }
        ],
        callout: "Nyquist theorem: sample rate ต้อง ≥ 2× ความถี่สูงสุดที่ต้องการ · 44100 Hz จับได้ถึง 22050 Hz (เกินหูคน 20kHz)",
        hints: [
          "rfft() สำหรับ real signal — เร็วกว่า fft() 2 เท่าและใช้ memory ครึ่ง",
          "dB = 20*log10(amplitude) — -6 dB = ครึ่งแอมพลิจูด, -20 dB = 1/10"
        ],
        techniques: [
          "FFT: time domain → frequency domain · ดู spectrum รู้ว่ามีความถี่อะไร",
          "Spectrogram = FFT sliding window — เห็นเวลา + ความถี่พร้อมกัน",
          "Window function (hann, hamming) ลด spectral leakage ที่ขอบ window"
        ],
        practice: "สร้าง sine wave 1000 Hz 1 วินาที FFT แล้วดู peak — ทำไม peak อยู่ที่ 1000 Hz"
      },
      {
        id: "21-2", file: "librosa_features.py", title: "Librosa — Music & Speech Features",
        tagline: "Library สำหรับ Music Information Retrieval ระดับโปร",
        body: `<p><b>librosa</b> คือ library วิเคราะห์เพลงและเสียงพูด — ใช้ใน Spotify, Shazam, แอป music genre classification</p>
          <p>ติดตั้ง: <code>pip install librosa</code></p>`,
        examples: [
          { label: "load_mfcc.py", note: "โหลดเสียง + MFCC", code: `import librosa\n\ny, sr = librosa.load(<span class="str">"song.wav"</span>, sr=22050)\nmfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)\nprint(mfcc.shape)  <span class="cmt"># (13, frames)</span>`, realLabel: "music_classifier.py", real: `import librosa\nimport numpy as np\n\n\ndef extract_features(path: str) -&gt; dict:\n    <span class="cmt">"""ดึง feature สำหรับ music classification"""</span>\n    y, sr = librosa.load(path, sr=22050, duration=30)\n\n    <span class="cmt"># 1. Tempo + beat</span>\n    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)\n\n    <span class="cmt"># 2. MFCC — timbre (เนื้อเสียง)</span>\n    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)\n    mfcc_mean = mfcc.mean(axis=1)\n\n    <span class="cmt"># 3. Chroma — โน้ตดนตรี (harmony)</span>\n    chroma = librosa.feature.chroma_stft(y=y, sr=sr)\n    chroma_mean = chroma.mean(axis=1)\n\n    <span class="cmt"># 4. Spectral centroid — ความสว่างของเสียง</span>\n    centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()\n\n    <span class="cmt"># 5. Zero crossing rate — noise-ness</span>\n    zcr = librosa.feature.zero_crossing_rate(y).mean()\n\n    return {\n        <span class="str">"tempo"</span>: float(tempo),\n        <span class="str">"mfcc_1_5"</span>: mfcc_mean[:5].tolist(),\n        <span class="str">"chroma_top"</span>: int(np.argmax(chroma_mean)),\n        <span class="str">"spectral_centroid"</span>: float(centroid),\n        <span class="str">"zcr"</span>: float(zcr),\n    }\n\n\n<span class="cmt"># สร้าง test tone</span>\nimport soundfile as sf\nsr = 22050\nt = np.linspace(0, 3, sr*3, endpoint=False)\nsig = 0.5 * np.sin(2*np.pi*440*t) * np.exp(-t*0.3)\nsf.write(<span class="str">"test.wav"</span>, sig, sr)\n\nfeats = extract_features(<span class="str">"test.wav"</span>)\nfor k, v in feats.items():\n    print(f<span class="str">"{k:20} = {v}"</span>)`
          },
          { label: "pitch.py", note: "ตรวจ pitch ต่อ frame", code: `f0, voiced, _ = librosa.pyin(y, fmin=80, fmax=400, sr=sr)\nprint(f<span class="str">"ค่า F0 เฉลี่ย: {np.nanmean(f0):.1f} Hz"</span>)`, realLabel: "speech_to_midi.py", real: `import librosa\nimport numpy as np\nimport soundfile as sf\n\n\ndef signal_to_notes(path: str, fmin: float = 65.0, fmax: float = 2000.0):\n    <span class="cmt">"""ตรวจ pitch ตลอดเพลง → note events"""</span>\n    y, sr = librosa.load(path, sr=22050)\n\n    <span class="cmt"># pyin = probabilistic YIN — แม่นกว่า YIN</span>\n    f0, voiced_flag, voiced_prob = librosa.pyin(\n        y, sr=sr, fmin=fmin, fmax=fmax,\n        frame_length=2048,\n    )\n\n    times = librosa.times_like(f0, sr=sr)\n\n    <span class="cmt"># group เป็น note events</span>\n    notes = []\n    cur_note, cur_start = None, None\n\n    def hz_to_note(hz):\n        if np.isnan(hz) or hz &lt;= 0: return None\n        n = round(12 * np.log2(hz / 440.0))\n        names = [<span class="str">"A"</span>,<span class="str">"A#"</span>,<span class="str">"B"</span>,<span class="str">"C"</span>,<span class="str">"C#"</span>,<span class="str">"D"</span>,<span class="str">"D#"</span>,<span class="str">"E"</span>,<span class="str">"F"</span>,<span class="str">"F#"</span>,<span class="str">"G"</span>,<span class="str">"G#"</span>]\n        return names[n % 12] + str(4 + (n // 12))\n\n    for t, hz in zip(times, f0):\n        note = hz_to_note(hz)\n        if note != cur_note:\n            if cur_note:\n                notes.append({\n                    <span class="str">"note"</span>: cur_note,\n                    <span class="str">"start"</span>: round(cur_start, 3),\n                    <span class="str">"dur"</span>: round(t - cur_start, 3),\n                })\n            cur_note, cur_start = note, t\n\n    return notes\n\n\nnotes = signal_to_notes(<span class="str">"test.wav"</span>)\nfor n in notes[:10]:\n    print(f<span class="str">"{n['note']:4} @ {n['start']:.2f}s ({n['dur']:.2f}s)"</span>)`
          }
        ],
        callout: "MFCC = ตัวเลข 13-40 ค่าแทน timbre ของเสียง — ใช้เป็น feature สำหรับ ML ได้ (genre, artist, mood classification)",
        hints: [
          "pyin แม่นกว่า yin แต่ช้ากว่า — เหมาะกับ offline analysis",
          "librosa.load(sr=None) เก็บ sample rate ต้นฉบับ — ระวัง memory ถ้าไฟล์ยาว"
        ],
        techniques: [
          "MFCC + chroma + spectral features = 40+ มิติสำหรับ music classification",
          "Tempo detection ใช้ onset strength + autocorrelation",
          "Speech-to-MIDI pipeline: pyin → quantize → MIDI note events"
        ],
        practice: "โหลด test.wav ตรวจ pitch เฉลี่ย (nanmean ของ f0) แล้วบอกว่าตรงกับโน้ตอะไร (เช่น 440 → A4)"
      },
      {
        id: "21-3", file: "speech_recognition.py", title: "Speech Recognition & Text-to-Speech",
        tagline: "ให้คอม 'ฟัง' และ 'พูด' ได้",
        body: `<p><b>STT</b> (Speech-to-Text) และ <b>TTS</b> (Text-to-Speech) — เทคโนโลยีที่ใช้ใน Alexa, Siri, Google Assistant</p>
          <p>ตัวเลือก:</p>
          <ul>
            <li><b>OpenAI Whisper</b> — แม่นสุด, หลายภาษา, ฟรี offline</li>
            <li><b>SpeechRecognition</b> — ครอบหลาย API (Google, Bing, Whisper)</li>
            <li><b>pyttsx3</b> / <b>gTTS</b> — Text-to-Speech</li>
          </ul>
          <p>ติดตั้ง: <code>pip install openai-whisper SpeechRecognition pyttsx3 gTTS</code></p>`,
        examples: [
          { label: "stt_simple.py", note: "STT เบื้องต้นด้วย SpeechRecognition", code: `import speech_recognition as sr\n\nr = sr.Recognizer()\nwith sr.Microphone() as src:\n    print(<span class="str">"พูดได้เลย..."</span>)\n    audio = r.listen(src)\n\nprint(r.recognize_google(audio, language=<span class="str">"th-TH"</span>))`, realLabel: "whisper_transcribe.py", real: `import whisper\nfrom pathlib import Path\n\n\n<span class="cmt"># โหลดโมเดล — tiny (fast) → large (accurate)</span>\nmodel = whisper.load_model(<span class="str">"base"</span>)\n\n\ndef transcribe_file(audio: Path, lang: str = <span class="str">"th"</span>) -&gt; dict:\n    result = model.transcribe(\n        str(audio),\n        language=lang,\n        task=<span class="str">"transcribe"</span>,      <span class="cmt"># หรือ "translate"</span>\n        verbose=False,\n    )\n    return {\n        <span class="str">"text"</span>: result[<span class="str">"text"</span>],\n        <span class="str">"segments"</span>: [\n            {<span class="str">"start"</span>: round(s[<span class="str">"start"</span>], 2),\n             <span class="str">"end"</span>: round(s[<span class="str">"end"</span>], 2),\n             <span class="str">"text"</span>: s[<span class="str">"text"</span>]}\n            for s in result[<span class="str">"segments"</span>]\n        ],\n    }\n\n\n<span class="cmt"># สร้าง output แบบ subtitle (.srt)</span>\ndef write_srt(segments: list[dict], path: str):\n    def fmt(t: float) -&gt; str:\n        h, m = int(t // 3600), int((t % 3600) // 60)\n        s = t % 60\n        return f<span class="str">"{h:02}:{m:02}:{s:06.3f}".replace(".", ",")"</span>\n\n    with open(path, <span class="str">"w"</span>, encoding=<span class="str">"utf-8"</span>) as f:\n        for i, seg in enumerate(segments, 1):\n            f.write(f<span class="str">"{i}\\n{fmt(seg['start'])} --&gt; {fmt(seg['end'])}\\n{seg['text'].strip()}\\n\\n"</span>)\n\n\nprint(<span class="str">"Whisper พร้อมใช้งาน — รองรับ 99 ภาษา, offline ได้"</span>)\nprint(<span class="str">"โมเดล: tiny=39MB, base=140MB, small=460MB, medium=1.5GB, large=3GB"</span>)`
          },
          { label: "tts.py", note: "Text-to-Speech ด้วย gTTS", code: `from gtts import gTTS\n\ntts = gTTS(<span class="str">"สวัสดีครับ ผมชื่อแพท"</span>, lang=<span class="str">"th"</span>)\ntts.save(<span class="str">"hello.mp3"</span>)`, realLabel: "voice_assistant.py", real: `import os\nimport tempfile\nimport speech_recognition as sr\nimport pyttsx3\n\n\nclass VoiceAssistant:\n    <span class="cmt">"""ผู้ช่วยเสียง — พูด-ตอบ ได้"""</span>\n    def __init__(self):\n        self.recognizer = sr.Recognizer()\n        self.tts = pyttsx3.init()\n        self.tts.setProperty(<span class="str">"rate"</span>, 180)\n        self.tts.setProperty(<span class="str">"volume"</span>, 1.0)\n\n    def speak(self, text: str) -&gt; None:\n        print(f<span class="str">"🤖: {text}"</span>)\n        self.tts.say(text)\n        self.tts.runAndWait()\n\n    def listen(self, timeout: int = 5, phrase_time: int = 8) -&gt; str | None:\n        with sr.Microphone() as src:\n            self.recognizer.adjust_for_ambient_noise(src, duration=0.5)\n            print(<span class="str">"🎤 กำลังฟัง..."</span>)\n            try:\n                audio = self.recognizer.listen(\n                    src, timeout=timeout,\n                    phrase_time_limit=phrase_time,\n                )\n                return self.recognizer.recognize_google(\n                    audio, language=<span class="str">"th-TH"</span>\n                )\n            except sr.WaitTimeoutError:\n                return None\n            except sr.UnknownValueError:\n                return <span class="str">""</span>\n\n    def respond(self, text: str) -&gt; str:\n        <span class="cmt"># จำลอง logic ตอบกลับ — ต่อกับ LLM ได้</span>\n        text = text.lower()\n        if <span class="str">"สวัสดี"</span> in text or <span class="str">"หวัดดี"</span> in text:\n            return <span class="str">"สวัสดีครับ มีอะไรให้ช่วยไหม"</span>\n        if <span class="str">"กี่โมง"</span> in text:\n            from datetime import datetime\n            return f<span class="str">"ตอนนี้ {datetime.now():%H:%M} น."</span>\n        if <span class="str">"อากาศ"</span> in text:\n            return <span class="str">"วันนี้ร้อนมากครับ อย่าลืมดื่มน้ำ"</span>\n        return f<span class="str">"ฉันได้ยินว่า '{text}' แต่ยังไม่เข้าใจ ลองถามใหม่นะ"</span>\n\n    def run(self):\n        self.speak(<span class="str">"สวัสดีครับ ผมพร้อมช่วยแล้ว"</span>)\n        while True:\n            user = self.listen()\n            if user is None: continue\n            if user in (<span class="str">"ออก"</span>, <span class="str">"ปิด"</span>, <span class="str">"quit"</span>):\n                self.speak(<span class="str">"ลาก่อนครับ"</span>)\n                break\n            self.speak(self.respond(user))\n\n\n<span class="cmt"># ต้องมีไมโครโฟน + ลำโพง</span>\nprint(<span class="str">"Voice assistant: Whisper-like STT + pyttsx3 TTS + custom logic"</span>)\nprint(<span class="str">"ต่อยอด: ใช้ OpenAI Whisper สำหรับ STT แม่นขึ้น + GPT สำหรับตอบ"</span>)`
          }
        ],
        callout: "Whisper รัน offline ได้ แต่ต้องมี RAM 2-8 GB ขึ้นกับโมเดล · ถ้าต้องการเร็วกว่านั้นใช้ faster-whisper (CTranslate2) เร็วกว่า 4 เท่า",
        hints: [
          "adjust_for_ambient_noise() จำเป็นในสภาพแวดล้อมมีเสียงรบกวน — ไม่งั้นจับคำผิด",
          "faster-whisper เร็วกว่า openai-whisper 4-5x ด้วย CPU เดียวกัน"
        ],
        techniques: [
          "STT pipeline: mic → WAV → Whisper/Google API → text",
          "TTS pipeline: text → gTTS (online) หรือ pyttsx3 (offline) → audio out",
          "Voice assistant ที่ดี: VAD (voice activity detection) → ลดการ listen เปล่า"
        ],
        practice: "เขียน script: บันทึกเสียง 3 วิจากไมโครโฟน → transcribe ด้วย Whisper → print ข้อความที่ได้ (ทดสอบพูด 'สวัสดีครับ')"
      }
    ]
  }
];