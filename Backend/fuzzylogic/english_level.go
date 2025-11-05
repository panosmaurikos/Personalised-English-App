// backend/fuzzylogic/english_level.go
package fuzzylogic

import (
	"fmt"
	"math"

	"github.com/panosmaurikos/personalisedenglish/backend/fuzzylogic/builder"
	"github.com/panosmaurikos/personalisedenglish/backend/fuzzylogic/crisp"
	"github.com/panosmaurikos/personalisedenglish/backend/fuzzylogic/fuzzy"
	"github.com/panosmaurikos/personalisedenglish/backend/fuzzylogic/id"
)

// Define IDs for inputs and outputs
var (
	ScoreID           = id.NewID() // Input: Score (0-100)
	AvgResponseTimeID = id.NewID() // Input: Avg Response Time (seconds)
	EnglishLevelID    = id.NewID() // Output: Level (0-100, mapped to Beginner/Intermediate/Advanced)
)

// Define Fuzzy Sets for Inputs and Output
func defineFuzzySets() (*fuzzy.IDVal, *fuzzy.IDVal, *fuzzy.IDVal, error) {
	// Universe for Score (0-100, discrete steps of 1)
	scoreUniverse, err := crisp.NewSet(0, 100, 1)
	if err != nil {
		return nil, nil, nil, err
	}

	// Fuzzy sets for Score
	scoreSets, err := fuzzy.NewIDSets(map[id.ID]fuzzy.SetBuilder{
		"low":    fuzzy.Triangular{A: 0, B: 20, C: 40},   // Low: 0-40
		"medium": fuzzy.Triangular{A: 30, B: 50, C: 70},  // Medium: 30-70
		"high":   fuzzy.Triangular{A: 60, B: 80, C: 100}, // High: 60-100
	})
	if err != nil {
		return nil, nil, nil, err
	}
	scoreVal, err := fuzzy.NewIDVal(ScoreID, scoreUniverse, scoreSets)
	if err != nil {
		return nil, nil, nil, err
	}

	// Universe for Avg Response Time (0-20 seconds, steps of 0.5)
	timeUniverse, err := crisp.NewSet(0, 20, 0.5)
	if err != nil {
		return nil, nil, nil, err
	}

	// Fuzzy sets for Avg Response Time
	timeSets, err := fuzzy.NewIDSets(map[id.ID]fuzzy.SetBuilder{
		"slow":   fuzzy.StepUp{A: 10, B: 20},          // Slow: 10+
		"normal": fuzzy.Triangular{A: 4, B: 8, C: 12}, // Normal: 4-12
		"fast":   fuzzy.StepDown{A: 0, B: 5},          // Fast: 0-5
	})
	if err != nil {
		return nil, nil, nil, err
	}
	timeVal, err := fuzzy.NewIDVal(AvgResponseTimeID, timeUniverse, timeSets)
	if err != nil {
		return nil, nil, nil, err
	}

	// Universe for Output Level (0-100)
	levelUniverse, err := crisp.NewSet(0, 100, 1)
	if err != nil {
		return nil, nil, nil, err
	}

	// Fuzzy sets for English Level
	levelSets, err := fuzzy.NewIDSets(map[id.ID]fuzzy.SetBuilder{
		"beginner":     fuzzy.Triangular{A: 0, B: 20, C: 40},   // Beginner: 0-40
		"intermediate": fuzzy.Triangular{A: 30, B: 50, C: 70},  // Intermediate: 30-70
		"advanced":     fuzzy.Triangular{A: 60, B: 80, C: 100}, // Advanced: 60-100
	})
	if err != nil {
		return nil, nil, nil, err
	}
	levelVal, err := fuzzy.NewIDVal(EnglishLevelID, levelUniverse, levelSets)
	if err != nil {
		return nil, nil, nil, err
	}

	return scoreVal, timeVal, levelVal, nil
}

// BuildFuzzyEngine creates the Mamdani fuzzy engine with rules and returns the engine along with the IDVals
func BuildFuzzyEngine() (fuzzy.Engine, *fuzzy.IDVal, *fuzzy.IDVal, *fuzzy.IDVal, error) {
	scoreVal, timeVal, levelVal, err := defineFuzzySets()
	if err != nil {
		return fuzzy.Engine{}, nil, nil, nil, err
	}

	// Use Mamdani builder
	cfg := builder.Mamdani()
	fl := cfg.FuzzyLogic()

	// Define rules - Score is more important than time
	// Low score rules
	fl.If(scoreVal.Get("low")).And(timeVal.Get("slow")).Then(levelVal.Get("beginner"))
	fl.If(scoreVal.Get("low")).And(timeVal.Get("normal")).Then(levelVal.Get("beginner"))
	fl.If(scoreVal.Get("low")).And(timeVal.Get("fast")).Then(levelVal.Get("beginner"))

	// Medium score rules
	fl.If(scoreVal.Get("medium")).And(timeVal.Get("slow")).Then(levelVal.Get("intermediate"))
	fl.If(scoreVal.Get("medium")).And(timeVal.Get("normal")).Then(levelVal.Get("intermediate"))
	fl.If(scoreVal.Get("medium")).And(timeVal.Get("fast")).Then(levelVal.Get("intermediate"))

	// High score rules - even with slow time, still advanced!
	fl.If(scoreVal.Get("high")).And(timeVal.Get("slow")).Then(levelVal.Get("advanced"))
	fl.If(scoreVal.Get("high")).And(timeVal.Get("normal")).Then(levelVal.Get("advanced"))
	fl.If(scoreVal.Get("high")).And(timeVal.Get("fast")).Then(levelVal.Get("advanced"))

	// Build engine
	engine, err := fl.Engine()
	if err != nil {
		return fuzzy.Engine{}, nil, nil, nil, err
	}
	return engine, scoreVal, timeVal, levelVal, nil
}

// EvaluateLevel runs the fuzzy engine and maps the output to a level string
func EvaluateLevel(score float64, avgTime float64) (string, int, error) {
	fmt.Println("Starting EvaluateLevel with score:", score, "avgTime:", avgTime)
	engine, scoreVal, timeVal, levelVal, err := BuildFuzzyEngine()
	if err != nil {
		fmt.Println("Error in BuildFuzzyEngine:", err)
		return "", 0, err
	}
	fmt.Println("Fuzzy engine built successfully")
	input := fuzzy.DataInput{
		scoreVal: score,
		timeVal:  avgTime,
	}
	fmt.Println("Input prepared:", input)
	output, err := engine.Evaluate(input)
	if err != nil {
		fmt.Println("Error in engine.Evaluate:", err)
		return "", 0, err
	}
	fmt.Println("Output from engine:", output)
	levelScore, ok := output[levelVal]
	if !ok {
		fmt.Println("Error: no output level found")
		return "", 0, fmt.Errorf("no output level found")
	}
	var level string
	switch {
	case levelScore <= 40:
		level = "Beginner"
	case levelScore <= 70:
		level = "Intermediate"
	default:
		level = "Advanced"
	}
	fmt.Printf("Final result: Level=%s, RawScore=%.15f\n", level, levelScore)

	levelScoreInt := int(math.Round(levelScore))
	return level, levelScoreInt, nil
}
