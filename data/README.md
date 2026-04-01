# Data

`ship-sentinel/data`는 데모 seed와 operator-created run을 분리하는 저장 영역이다.

구성:

- `demo-audit.json`
- `demo-references.json`
- `demo-workspace.json`
- `autonomy-status.json`
- `run-library.json`
- `runs/`

생성되는 앱 미러:

- `../app/data/run-library.js`
- `../app/data/run-payloads.js`
- `../app/data/autonomy-status.js`

원칙:

- `demo-*` 파일은 seed나 예시 데이터다
- 실제 생성된 감사 런은 `runs/` 아래에 저장한다
- `run-library.json`은 `runs/` 인덱스다
