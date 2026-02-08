# リポジトリ調査まとめ

## 概要

このリポジトリは「つくりながら学ぶ！ドメイン駆動設計 実践入門」の実装例を段階的に示すサポートリポジトリ。

## ディレクトリ構造

```
hands-on-ddd-introduction/
├── chapter-05/           # ドメインモデルの可視化（PlantUML）
├── chapter-08/           # 実装準備（基本的なプロジェクトセットアップ）
├── chapter-09/           # 値オブジェクト
├── chapter-10/           # エンティティ
├── chapter-11/           # 集約
├── chapter-12/           # ドメインサービス
├── chapter-13/           # リポジトリ（PostgreSQL導入）
├── chapter-14/           # アプリケーションサービス
├── chapter-15/           # プレゼンテーション層（Express.js）
├── chapter-17/           # 中核ビジネスロジックの独立性（ESLint）
├── chapter-18/           # 技術実装からの分離（DI: tsyringe）
├── chapter-19/           # イベント駆動アーキテクチャ
├── chapter-20/           # Outboxパターン
├── chapter-21/           # イベントソーシング
├── contexts/             # 調査・学習メモ
└── docker-setup/         # Docker設定
```

## 4層アーキテクチャ

```
src/
├── Domain/           # ドメイン層
├── Application/      # アプリケーション層
├── Infrastructure/   # インフラストラクチャ層
└── Presentation/     # プレゼンテーション層
```

### Domain層（ドメイン層）

- ビジネスルールの実装
- 値オブジェクト・エンティティ・集約の定義
- ドメインサービスの実装
- ドメインイベントの定義
- リポジトリインターフェース（抽象）の定義
- **外部フレームワークへの依存なし**

```
Domain/
├── models/
│   ├── Book/
│   │   ├── BookIdentity/        # 集約ルート
│   │   ├── BookId/              # 値オブジェクト（ISBN）
│   │   ├── Title/               # 値オブジェクト
│   │   ├── Author/              # 値オブジェクト
│   │   ├── Price/               # 値オブジェクト
│   │   ├── Book.ts              # エンティティ
│   │   └── IBookRepository.ts   # リポジトリインターフェース
│   └── Review/
│       ├── ReviewIdentity/
│       ├── ReviewId/
│       ├── Name/
│       ├── Rating/
│       ├── Comment/
│       ├── Review.ts
│       └── IReviewRepository.ts
├── services/
│   └── Review/
│       └── BookRecommendationDomainService/
└── shared/
    ├── DomainEvent/
    ├── Aggregate.ts             # 集約基底クラス
    └── ValueObject.ts           # 値オブジェクト基底クラス
```

### Application層（アプリケーション層）

- ユースケースの実装（各Serviceクラス）
- ドメイン層のオブジェクトを組み合わせたロジック
- トランザクション管理
- イベントハンドラの登録
- DTO（Data Transfer Objects）の定義
- **ドメイン層のみに依存**

```
Application/
├── Book/
│   └── RegisterBookService/
├── Review/
│   ├── AddReviewService/
│   ├── EditReviewService/
│   ├── DeleteReviewService/
│   └── GetRecommendedBooksService/
├── DomainEventHandlers/
│   └── CatalogServiceEventHandler.ts
├── EventStore/
│   └── PendingEventsPublisher.ts    # Outboxパターン実装
└── shared/
    ├── ITransactionManager.ts
    └── DomainEvent/
```

### Infrastructure層（インフラストラクチャ層）

- リポジトリインターフェースの具体実装
  - SQL実装（PostgreSQL）
  - InMemory実装（テスト用）
- データベース接続・マイグレーション管理
- イベント発行・購読実装
- トランザクション管理の実装
- **PostgreSQL、tsyringe、EventEmitterなど外部技術に依存**

```
Infrastructure/
├── SQL/
│   ├── Book/
│   │   └── SQLBookRepository.ts
│   ├── Review/
│   │   └── SQLReviewRepository.ts
│   ├── EventStore/
│   │   └── SQLEventStoreRepository.ts
│   ├── migrations/
│   ├── db.ts
│   ├── SQLClientManager.ts
│   └── SQLTransactionManager.ts
├── InMemory/
│   ├── Book/
│   ├── Review/
│   └── EventStore/
└── EventEmitter/
    ├── EventEmitterDomainEventPublisher.ts
    ├── EventEmitterDomainEventSubscriber.ts
    └── EventEmitterClient.ts
```

### Presentation層（プレゼンテーション層）

- REST APIエンドポイントの定義
- HTTPリクエスト・レスポンス処理
- 入力値検証
- **Application層を呼び出す**

```
Presentation/
└── Express/
    └── index.ts
```

## 技術スタック

| 分類 | 技術 | バージョン |
|------|------|----------|
| 言語 | TypeScript | 5.9.3 |
| Webフレームワーク | Express | 5.1.0 |
| データベース | PostgreSQL | 15 |
| DBクライアント | pg（ネイティブクエリ） | 8.16.3 |
| DI コンテナ | tsyringe | 4.10.0 |
| テスティング | Jest | 29.7.0 |
| ID生成 | nanoid | 3.3.11 |
| ユーティリティ | lodash | 4.17.21 |
| リンター | ESLint | 9.37.0 |

## Expressの使用箇所

Expressは **Presentation層のみ** に限定されている：

- `chapter-15/CatalogService/src/Presentation/Express/index.ts`
- `chapter-20/CatalogService/src/Presentation/Express/index.ts`
- `chapter-21/CatalogService/src/Presentation/Express/index.ts`

### chapter-20のExpress実装例

```typescript
import express, { json, Response } from "express";
const app = express();
const port = 3000;

app.use(json());

// 書籍取得
app.get("/book/:isbn/recommendations", async (req, res) => { ... });

// 書籍登録
app.post("/book", async (req, res) => { ... });

// レビュー投稿
app.post("/book/:isbn/review", async (req, res) => { ... });

// レビュー編集
app.put("/review/:reviewId", async (req, res) => { ... });

// レビュー削除
app.delete("/review/:reviewId", async (req, res) => { ... });

app.listen(port, () => {
  container.resolve(CatalogServiceEventHandler).register();
  container.resolve(PendingEventsPublisher).start();
});
```

## 依存関係の流れ

```
Presentation (Express)
    ↓
Application (Service)
    ↓
Domain (Model, Service, Event)
    ↑
Infrastructure (Repository, EventStore, EventEmitter)
    ↓
Database (PostgreSQL) / EventBus
```

## 基底クラス

### ValueObject

```typescript
abstract class ValueObject<T, U> {
  constructor(value: T) {
    this.validate(value);
    this._value = value;
  }
  equals(other: ValueObject<T, U>): boolean {
    return isEqual(this._value, other._value);
  }
}
```

### Aggregate

```typescript
abstract class Aggregate<Event extends DomainEvent> {
  domainEvents: Event[] = [];
  protected addDomainEvent(domainEvent: Event) {
    this.domainEvents.push(domainEvent);
  }
  getDomainEvents(): Event[] {
    return this.domainEvents;
  }
  clearDomainEvents() {
    this.domainEvents = [];
  }
}
```

## 章ごとの進化

| Chapter | ファイル数 | 主な追加・変更 |
|---------|-----------|---------------|
| chapter-08 | 0 | 基本セットアップのみ（設定ファイル） |
| chapter-11 | 25 | 値オブジェクト、エンティティ、集約の実装開始 |
| chapter-14 | 55 | アプリケーションサービス層追加 |
| chapter-15 | 56 | Express REST API追加 |
| chapter-20 | 72 | Outboxパターン、Pub/Sub、イベント駆動 |

## Honoへの移行について

DDDの設計が適切に行われているため、Expressの影響範囲は **Presentation層のみ** に限定されている。Domain層やApplication層には一切影響せずに移行可能。

### 移行対象ファイル

- `src/Presentation/Express/index.ts` を `src/Presentation/Hono/index.ts` に置き換え
- `package.json` の依存関係を更新（express → hono）
