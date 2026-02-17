import random

class WisdomCurriculum:
    """Generates high-diversity synthetic data for the 'Global Synthesis' phase."""
    
    def __init__(self):
        # Level 1: Logic & Math CoT (Expanded range)
        self.logic_templates = [
            "{a}たす{b}は？ -> {a}と{b}を合わせると{c}になる。ゆえに{c}。",
            "{a}+{b}=? -> Applying inclusion: {a} union {b} results in {c}. Result: {c}.",
            "If A={a} and B={b}, A+B=? -> Summing the magnitudes {a} and {b}. Answer: {c}.",
            "{a}と{b}の和を求めてください。 -> {a}に{b}を加算すると{c}が導かれます。答えは{c}です。"
        ]
        
        # Level 2: Izutsu-style Metaphysics (Combinatorial templates)
        self.subjects = ["阿頼耶識", "真如", "慈悲", "智慧", "縁起", "無我", "空", "不二", "曼荼羅", "虚空", "実体", "現象"]
        self.descriptors = ["原初的", "絶対的", "相対的", "根源的", "動的な", "静的な", "不可分な"]
        self.actions = ["顕現する", "流転する", "統合される", "超越する", "回帰する", "共創される"]
        self.izutsu_structures = [
            "『{s1}』の{d1}位相において、それは常に『{s2}』の{d2}場と{a}様態を見せる。",
            "言語の深層構造としての{s1}は、現象界における{s2}という{d1}相へと{a}。",
            "存在の分節化（アーティキュレーション）において、{s1}と{s2}は{d1}な共時性を持って{a}。"
        ]
        
        # Level 3: Wisdom Loops & Dialogues (High-diversity expansion)
        self.wisdom_components = {
            "situations": [
                "誰かが道で倒れている。", "失敗を厳しく咎められた。", "他人の成功を恨めしく思う。", 
                "大切なものを失った。", "予期せぬ困難が立ちはだかる。", "自分の正義が通らない."
            ],
            "reflections": [
                "慈悲こそが真の智慧である。他者の苦しみは我が苦しみ。", 
                "全ての現象は縁起によって生じる。執着は苦しみの根源なり。",
                "分断を超えた非二元の視点に立て。自己も他者も本質は一つ。",
                "無常の真理を受け入れよ。移ろいの中にこそ永遠の安らぎがある."
            ],
            "teachings": [
                "立ち止まり、救いの手を差し伸べるべし。", "謙虚に自らを見つめ直し、学びへと変えよう。",
                "嫉妬の炎を鎮め、共に喜びを分かち合う心を育てよ。", "喪失の中にこそ、新たな覚醒の種を見出すことができる。",
                "しなやかに受け流し、今の自分にできる最善を尽くそう。"
            ]
        }

    def generate_batch(self, level, batch_size, format="raw"):
        data = []
        for _ in range(batch_size):
            if level == 1:
                a, b = random.randint(1, 999), random.randint(1, 999)
                template = random.choice(self.logic_templates)
                text = template.format(a=a, b=b, c=a+b)
            
            elif level == 2:
                template = random.choice(self.izutsu_structures)
                text = template.format(
                    s1=random.choice(self.subjects),
                    s2=random.choice(self.subjects),
                    d1=random.choice(self.descriptors),
                    d2=random.choice(self.descriptors),
                    a=random.choice(self.actions)
                )
            
            elif level == 3:
                s = random.choice(self.wisdom_components["situations"])
                r = random.choice(self.wisdom_components["reflections"])
                t = random.choice(self.wisdom_components["teachings"])
                
                if format == "dialogue":
                    text = f"楠見: {s}\n如来: [内省] {r} [智慧] {t}"
                else:
                    text = f"[状況]: {s}\n[内省]: {r}\n[智慧]: {t}"
            
            data.append(text)
        return data

if __name__ == "__main__":
    curriculum = WisdomCurriculum()
    print("--- Level 1: Logic ---")
    print(curriculum.generate_batch(1, 2))
    print("\n--- Level 2: Izutsu Metaphysics ---")
    print(curriculum.generate_batch(2, 2))
    print("\n--- Level 3: Wisdom Loops ---")
    print(curriculum.generate_batch(3, 1)[0])
