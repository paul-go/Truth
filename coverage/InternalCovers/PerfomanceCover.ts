
namespace CoverTruth
{
	async function coverPerformance()
	{
		const code = `
			Type
			Standard, Product, Number, Class, Hole Size, Finish, Grade, Material : Type
			Thread Type, Drive Type, Head Style, Som : Type
			Decimal, Fraction : Number
			
			mm, n-mm^2 : Decimal
			/(\d*\.)?\d+ : Decimal
			
			in : Fraction, Decimal
			/\d+[ \/\d]* : Fraction
			
			Range : Class
				Min : Number
				Max : Number
				Nom : Number
			
			Metric Hole Size, Inch Hole Size : Hole Size
			
			M1.6, M2, M2.5, M3, M3.5, M4, M5, M8, M10 : Metric Hole Size
			
			0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 1/4, 16, 18, 5/16, 20, 24, 3/8, 7/16, 1/2 : Inch Hole Size
			
			Zinc Plated, Yellow Zinc Plated, Trivalent Zinc Plated : Finish
			
			1018 : Grade
			
			4.8 Steel, Low Carbon Steel : Material
			
			Coarse, Fine, UNF, UNC : Thread Type
			
			Pan, Round : Head Style
			
			Slot : Drive Type
			
			Metric, Inch : Som
			
			ms : Product
				Som : Som
				Hole Size : Hole Size
				Head Height : Range
				Head Diameter : Range
				Head Style : Head Style
				Drive Type : Drive Type
				Thread Type : Thread Type
				Thread Pitch : Number
				Material : Material
				Grade : Grade
				Finish : Finish
				Tensile Strength : Number
				Length : Number
			
			mms : ms
				Som : Metric
				Hole Size : Metric Hole Size
				Head Height : Range
					Min : mm
					Max : mm
					Nom : mm
				Head Diameter : Range
					Min : mm
					Max : mm
					Nom : mm
				Thread Pitch : mm
				Tensile Strength : n-mm^2
				Length : mm
			
			ISO 1580 : Standard
				Head Style : Pan
				Drive Type : Slot
				Thread Type : Coarse
				Thread Pitch : mm
				Head Height : Range
					Min : mm
					Max : mm
					Nom : Max
				Head Diameter : Range
					Min : mm
					Max : mm
					Nom : Max
			
			ISO 1580 M1.6 : ISO 1580
				Hole Size : M1.6
				Thread Pitch : 0.35
				Head Height
					Max : 1
					Min : 0.86
				Head Diameter
					Max : 3.2
					Min : 2.9
			
			ISO 1580 M2 : ISO 1580
				Hole Size : M2
				Thread Pitch : 0.4
				Head Height
					Max : 1.5
					Min : 1.36
				Head Diameter
					Max : 5
					Min : 4.7
			
			
			ISO 1580 M2.5 : ISO 1580
				Hole Size : M2.5
				Thread Pitch : 0.45
				Head Height
					Max : 1.5
					Min : 1.36
				Head Diameter
					Max : 5
					Min : 4.7
			
			ISO 1580 M3 : ISO 1580
				Hole Size : M3
				Thread Pitch : 0.5
				Head Height
					Max : 1.8
					Min : 1.66
				Head Diameter
					Max : 5.6
					Min : 5.3
			
			ISO 1580 M3.5 : ISO 1580
				Hole Size : M3.5
				Thread Pitch : 0.6
				Head Height
					Max : 2.1
					Min : 1.96
				Head Diameter
					Max : 7
					Min : 6.64
			
			ISO 1580 M4 : ISO 1580
				Hole Size : M4
				Thread Pitch : 0.7
				Head Height
					Max : 2.4
					Min : 2.26
				Head Diameter
					Max : 8
					Min : 7.64
			
			ISO 1580 M5 : ISO 1580
				Hole Size : M5
				Thread Pitch : 0.8
				Head Height
					Max : 3
					Min : 2.86
				Head Diameter
					Max : 9.5
					Min : 9.14
			
			ISO 1580 M6 : ISO 1580
				Hole Size : M6
				Thread Pitch : 1
				Head Height
					Max : 3.6
					Min : 3.3
				Head Diameter
					Max : 12
					Min : 11.57
			
			ISO 1580 M8 : ISO 1580
				Hole Size : M8
				Thread Pitch : 1.25
				Head Height
					Max : 4.8
					Min : 4.5
				Head Diameter
					Max : 16
					Min : 15.57
			
			ISO 1580 M10 : ISO 1580
				Hole Size : M10
				Thread Pitch : 1.5
				Head Height
					Max : 6
					Min : 5.7
				Head Diameter
					Max : 20
					Min : 19.48
			
			
			ISO 898-1 : Standard
				Tensile Strength : Range
					Min : n-mm^2
					Max : n-mm^2
			
			ISO 898-1 4.8 : ISO 898-1
				Material : 4.8 Steel
				Tensile Strength
					Min : 400
					Max : 600
			
			Inch ms : ms
				Som : Inch
				Hole Size : Inch Hole Size
				Head Height : Range
					Min : in
					Max : in
				Head Diameter : Range
					Min : in
					Max : in
				Thread Pitch : Decimal
				Length : in
			
			1-64 ms : Inch ms
				Thread Type : UNC
				Hole Size : 1
				Thread Pitch : 64
			
			2-56 ms : Inch ms
				Thread Type : UNC
				Hole Size : 2
				Thread Pitch : 56
			
			3-48 ms : Inch ms
				Thread Type : UNC
				Hole Size : 3
				Thread Pitch : 48
			
			4-40 ms : Inch ms
				Thread Type : UNC
				Hole Size : 4
				Thread Pitch : 40
			
			5-40 ms : Inch ms
				Thread Type : UNC
				Hole Size : 5
				Thread Pitch : 40
			
			6-32 ms : Inch ms
				Thread Type : UNC
				Hole Size : 6
				Thread Pitch : 32
			
			8-32 ms : Inch ms
				Thread Type : UNC
				Hole Size : 8
				Thread Pitch : 32
			
			10-24 ms : Inch ms
				Thread Type : UNC
				Hole Size : 10
				Thread Pitch : 24
			
			12-24 ms : Inch ms
				Thread Type : UNC
				Hole Size : 12
				Thread Pitch : 24
			
			1/4-20 ms : Inch ms
				Thread Type : UNC
				Hole Size : 1/4
				Thread Pitch : 20
			
			5/16-18 ms : Inch ms
				Thread Type : UNC
				Hole Size : 5/16
				Thread Pitch : 18
			
			3/8-16 ms : Inch ms
				Thread Type : UNC
				Hole Size : 3/8
				Thread Pitch : 16
			
			7/16-14 ms : Inch ms
				Thread Type : UNC
				Hole Size : 7/16
				Thread Pitch : 14
			
			1/2-13 ms : Inch ms
				Thread Type : UNC
				Hole Size : 1/2
				Thread Pitch : 13
			
			0-80 ms : Inch ms
				Thread Type : UNF
				Hole Size : 0
				Thread Pitch : 80
			
			1-72 ms : Inch ms
				Thread Type : UNF
				Hole Size : 1
				Thread Pitch : 72
			
			2-64 ms : Inch ms
				Thread Type : UNF
				Hole Size : 2
				Thread Pitch : 64
			
			3-56 ms : Inch ms
				Thread Type : UNF
				Hole Size : 3
				Thread Pitch : 56
			
			4-48 ms : Inch ms
				Thread Type : UNF
				Hole Size : 4
				Thread Pitch : 48
			
			6-40 ms : Inch ms
				Thread Type : UNF
				Hole Size : 6
				Thread Pitch : 40
			
			8-36 ms : Inch ms
				Thread Type : UNF
				Hole Size : 8
				Thread Pitch : 36
			
			10-32 ms : Inch ms
				Thread Type : UNF
				Hole Size : 10
				Thread Pitch : 32
			
			1/4-28 ms : Inch ms
				Thread Type : UNF
				Hole Size : 1/4
				Thread Pitch : 28
			
			4-36 ms : Inch ms
				Thread Type : NS
				Hole Size : 4
				Thread Pitch : 36
			
			ASME B18.6.3 : Standard, Inch ms
			
			ASME B18.6.3 Round : ASME B18.6.3
				Head Style : Round
			
			ASME B18.6.3 Round 0 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .113
					Min : .099
				Head Height : Range
					Max : .053
					Min : .043
			
			ASME B18.6.3 Round 1 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .138
					Min : .122
				Head Height : Range
					Max : .061
					Min : .051
			
			ASME B18.6.3 Round 2 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .162
					Min : .146
				Head Height : Range
					Max : .069
					Min : .059
			
			ASME B18.6.3 Round 3 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .187
					Min : .169
				Head Height : Range
					Max : .078
					Min : .067
			
			ASME B18.6.3 Round 4 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .211
					Min : .193
				Head Height : Range
					Max : .086
					Min : .075
			
			ASME B18.6.3 Round 5 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .236
					Min : .217
				Head Height : Range
					Max : .095
					Min : .083
			
			ASME B18.6.3 Round 6 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .260
					Min : .240
				Head Height : Range
					Max : .103
					Min : .091
			
			ASME B18.6.3 Round 7 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .285
					Min : .264
				Head Height : Range
					Max : .111
					Min : .099
			
			ASME B18.6.3 Round 8 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .309
					Min : .287
				Head Height : Range
					Max : .120
					Min : .107
			
			ASME B18.6.3 Round 10 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .359
					Min : .334
				Head Height : Range
					Max : .137
					Min : .123
			
			ASME B18.6.3 Round 12 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .408
					Min : .382
				Head Height : Range
					Max : .153
					Min : .139
			
			ASME B18.6.3 Round 14 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .408
					Min : .382
				Head Height : Range
					Max : .153
					Min : .139
			
			ASME B18.6.3 Round 1/4 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .472
					Min : .443
				Head Height : Range
					Max : .175
					Min : .160
			
			ASME B18.6.3 Round 16 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .506
					Min : .476
				Head Height : Range
					Max : .187
					Min : .171
			
			ASME B18.6.3 Round 18 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .555
					Min : .523
				Head Height : Range
					Max : .204
					Min : .187
			
			ASME B18.6.3 Round 5/16 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .590
					Min : .557
				Head Height : Range
					Max : .216
					Min : .198
			
			ASME B18.6.3 Round 20 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .604
					Min : .570
				Head Height : Range
					Max : .220
					Min : .203
			
			ASME B18.6.3 Round 24 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .702
					Min : .664
				Head Height : Range
					Max : .254
					Min : .235
			
			ASME B18.6.3 Round 3/8 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .708
					Min : .670
				Head Height : Range
					Max : .256
					Min : .237
			
			ASME B18.6.3 Round 7/16 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .750
					Min : .707
				Head Height : Range
					Max : .328
					Min : .307
			
			ASME B18.6.3 Round 1/2 : ASME B18.6.3 Round
				Head Diameter : Range
					Max : .813
					Min : .766
				Head Height : Range
					Max : .355
					Min : .332
			
			MS-1013 : 0-80 ms, ASME B18.6.3 Round 0
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-789 : 1-72 ms, ASME B18.6.3 Round 1
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-457 : 1-64 ms, ASME B18.6.3 Round 1
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-458 : 1-64 ms, ASME B18.6.3 Round 1
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/2
			
			1467 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-779 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3 1/4
			
			380-F08-1N : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			380-F24-2K : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			380-F57-1C : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			380-F77-1X : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			871 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-1021 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 6
			
			MS-1097 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-1117 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2
			
			MS-1118 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			MS-1119 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			MS-390 : 1/4-28 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			MS-73 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-75 : 1/4-20 ms, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			1027 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			1028 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			1028-A : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			1484 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			380-131 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4 1/4
			
			380-807 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4 1/2
			
			380-F18-1Y : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F21-1C : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 6
			
			380-F25-1W : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			380-F49-1W : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			380-F63-1W : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F70-1Y : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-F72-1N : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			B-1467 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			B-1506 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			MS-1005 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			MS-1080 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-1093 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-1094 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-1158 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-12 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-1204 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			MS-13 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			MS-14 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-15 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-180 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-192 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-275 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 3/8
			
			MS-414 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-61 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-63 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 1/2
			
			MS-64 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			MS-65 : 10-24 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-66 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-67 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-68 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			MS-69 : 10-32 ms, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			1032 : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			1032-A : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			1153 : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/4
			
			2077-A : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			380-796 : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			380-797 : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F07-1C : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			380-F20-1Y : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-71 : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			MS-72 : 12-24 ms, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			380-F04-1A : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-F09-1T : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-F12-1K : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			380-F13-1W : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			380-F19-1C : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-1515 : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			B-1516 : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-35 : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/8
			
			MS-37 : 2-56 ms, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/16
			
			MS-264 : 3-48 ms, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-265 : 3-48 ms, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-266 : 3-56 ms, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-359 : 3-48 ms, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1
			
			MS-401 : 3-56 ms, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-787 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			380-806 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-808 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			380-F40-1M : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F50-1K : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2
			
			380-F75-1W : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-1104 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-1105 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 6
			
			MS-365 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1
			
			MS-385 : 3/8-16 ms, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F02-1M : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Clear Trivalent Plated
				Drive Type : Slot
				Length : 5/8
			
			380-F10-1N : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F11-1T : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			380-F26-1M : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			380-F33-1K : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Trivalent
				Drive Type : Slot
				Length : 1 1/2
			
			380-F52-1M : 4-36 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F53-1X : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-411 : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-1189 : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2
			
			MS-44 : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/8
			
			MS-46 : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			MS-49 : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			MS-50 : 4-40 ms, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 1/4
			
			MS-1016 : 5-40 ms, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-1307 : 5-40 ms, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-268 : 5-40 ms, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-269 : 5-40 ms, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-270 : 5-40 ms, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1
			
			380-F48-1K : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F54-1A : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			380-F78-1A : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F88-1M : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-1099 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-1100 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-1101 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 6
			
			MS-1120 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-1166 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			MS-382 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-387 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-484 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Chromate
				Drive Type : Slot
				Length : 3
			
			MS-76 : 5/16-18 ms, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-768 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			380-F22-1N : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-F36-1C : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			380-F37-1W : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			380-F41-1X : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F42-1A : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			380-F69-1C : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 1/2
			
			786 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			786A : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-1499 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/4
			
			B-1509 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-271 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			MS-3 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2
			
			MS-53 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 7/16
			
			MS-54 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-55 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			MS-7 : 6-32 ms, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			1042 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-F01-1K : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			380-F05-1P : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F23-1T : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 4
			
			380-F83-1C : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F89-1X : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			785 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			785A : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			B-1500 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-1502 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			B-1503 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-10 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-1244 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			MS-274 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-368 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-57 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-58 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-9 : 8-32 ms, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2 1/2
			
			382-577 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585 : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502 : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514 : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524 : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1T : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538 : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550 : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563 : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575 : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			
			382-577X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585X : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502X : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514X : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524X : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1TX : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538X : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550X : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563X : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575X : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			
			382-577Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585Y : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502Y : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514Y : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524Y : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1TY : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538Y : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550Y : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563Y : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575Y : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			
			382-577Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585Z : mms, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502Z : mms, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514Z : mms, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524Z : mms, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1TZ : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538Z : mms, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550Z : mms, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563Z : mms, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575Z : mms, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
		`;
		
		const program = new Truth.Program();
		const profileName = "Truth Document Load";
		console.time(profileName);
		await program.addDocument(code);
		program.check();
		console.timeEnd(profileName);
		console;
	}
}
