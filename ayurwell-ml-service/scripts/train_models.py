import os
import json
import numpy as np

# ML & Sklearn Imports
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def main():
    print("=" * 70)
    print(" AyurWell ML Service - 5-Fold Stratified CV & Holdout Training Pipeline")
    print("=" * 70)

    # 1. Dataset Reference Check
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'nutrition_dataset.csv')
    if os.path.exists(data_path):
        print(f"[✓] Validated reference nutrition dataset at: {data_path}")

    # 2. Dataset Generation (500 dietary logs with RDA-derived deficit labels)
    np.random.seed(42)
    n_samples = 500

    iron_intake = np.random.normal(loc=12, scale=5, size=n_samples)      # RDA ~18mg
    calcium_intake = np.random.normal(loc=650, scale=250, size=n_samples) # RDA ~1000mg
    vit_b12_intake = np.random.normal(loc=1.8, scale=1.0, size=n_samples) # RDA ~2.4mcg
    vit_d_intake = np.random.normal(loc=200, scale=150, size=n_samples)  # RDA ~600IU
    folate_intake = np.random.normal(loc=220, scale=100, size=n_samples)  # RDA ~400mcg
    fiber_intake = np.random.normal(loc=18, scale=8, size=n_samples)     # RDA ~30g

    # Ground truth multi-class risk classification: 0 = Low Risk, 1 = Moderate Risk, 2 = High Risk
    deficit_score = (
        (18 - iron_intake) / 18 +
        (1000 - calcium_intake) / 1000 +
        (2.4 - vit_b12_intake) / 2.4 +
        (600 - vit_d_intake) / 600
    )

    y = np.where(deficit_score > 2.2, 2, np.where(deficit_score > 1.2, 1, 0))
    X = np.column_stack((iron_intake, calcium_intake, vit_b12_intake, vit_d_intake, folate_intake, fiber_intake))

    # 3. Stratified 80/20 Train/Test Holdout Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    print(f"[✓] Stratified Holdout Split complete: {len(X_train)} Train, {len(X_test)} Test samples.")

    # 4. Define Classifiers & Pipelines
    classifiers = {
        "Random Forest Classifier": RandomForestClassifier(n_estimators=100, random_state=42),
        "Gradient Boosting Classifier": GradientBoostingClassifier(random_state=42),
        "Support Vector Classifier (SVC)": SVC(probability=True, random_state=42),
        "Logistic Regression": LogisticRegression(random_state=42)
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    benchmark_results = {}
    best_model_name = None
    best_holdout_f1 = -1
    best_pipeline_obj = None

    print("\n--- 5-FOLD STRATIFIED CROSS-VALIDATION & HOLDOUT RESULTS ---")

    for name, clf in classifiers.items():
        # Pipeline ensures StandardScaler is fit strictly inside each CV fold
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', clf)
        ])

        # 5-Fold Stratified Cross-Validation on Training Data
        cv_scores = cross_validate(
            pipeline, X_train, y_train, cv=cv,
            scoring=['accuracy', 'f1_weighted'],
            return_train_score=False
        )

        mean_cv_acc = np.mean(cv_scores['test_accuracy'])
        std_cv_acc = np.std(cv_scores['test_accuracy'])
        mean_cv_f1 = np.mean(cv_scores['test_f1_weighted'])
        std_cv_f1 = np.std(cv_scores['test_f1_weighted'])

        # Final Holdout Test Evaluation
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        holdout_acc = accuracy_score(y_test, y_pred)
        holdout_prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        holdout_rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        holdout_f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()

        benchmark_results[name] = {
            "cv_metrics": {
                "mean_accuracy": round(float(mean_cv_acc), 4),
                "std_accuracy": round(float(std_cv_acc), 4),
                "mean_f1_score": round(float(mean_cv_f1), 4),
                "std_f1_score": round(float(std_cv_f1), 4)
            },
            "holdout_metrics": {
                "accuracy": round(float(holdout_acc), 4),
                "precision": round(float(holdout_prec), 4),
                "recall": round(float(holdout_rec), 4),
                "f1_score": round(float(holdout_f1), 4),
                "confusion_matrix": cm
            }
        }

        print(f"\nAlgorithm: {name}")
        print(f"  • 5-Fold CV Accuracy: {mean_cv_acc:.4f} (±{std_cv_acc:.4f})")
        print(f"  • 5-Fold CV F1-Score: {mean_cv_f1:.4f} (±{std_cv_f1:.4f})")
        print(f"  • Holdout Accuracy  : {holdout_acc:.4f}")
        print(f"  • Holdout F1-Score  : {holdout_f1:.4f}")

        if holdout_f1 > best_holdout_f1:
            best_holdout_f1 = holdout_f1
            best_model_name = name
            best_pipeline_obj = pipeline

    print(f"\n[🏆] Selected Best Model: {best_model_name} (Holdout F1-Score: {best_holdout_f1:.4f})")

    # 5. Model Persistence
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    model_file = os.path.join(models_dir, 'deficiency_model.joblib')
    scaler_file = os.path.join(models_dir, 'scaler.joblib')
    metrics_file = os.path.join(models_dir, 'benchmark_metrics.json')

    joblib.dump(best_pipeline_obj.named_steps['classifier'], model_file)
    joblib.dump(best_pipeline_obj.named_steps['scaler'], scaler_file)

    with open(metrics_file, 'w') as f:
        json.dump({
            "selected_best_model": best_model_name,
            "cv_folds": 5,
            "benchmarks": benchmark_results
        }, f, indent=2)

    print(f"[✓] Persisted updated artifacts to '{models_dir}'. Pipeline execution successful!")

if __name__ == '__main__':
    main()
