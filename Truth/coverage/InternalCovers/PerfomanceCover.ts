
namespace Truth
{
	async function coverPerformance()
	{
		const code = `
			Type
			Standard, Product, Number, Class, Hole Size, Finish, Grade, Material : Type
			Thread Type, Drive Type, Head Style, System of Measurement : Type
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
			
			Metric, Inch : System of Measurement
			
			Machine Screw : Product
				System of Measurement : System of Measurement
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
			
			Metric Machine Screw : Machine Screw
				System of Measurement : Metric
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
			
			Inch Machine Screw : Machine Screw
				System of Measurement : Inch
				Hole Size : Inch Hole Size
				Head Height : Range
					Min : in
					Max : in
				Head Diameter : Range
					Min : in
					Max : in
				Thread Pitch : Decimal
				Length : in
			
			1-64 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 1
				Thread Pitch : 64
			
			2-56 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 2
				Thread Pitch : 56
			
			3-48 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 3
				Thread Pitch : 48
			
			4-40 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 4
				Thread Pitch : 40
			
			5-40 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 5
				Thread Pitch : 40
			
			6-32 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 6
				Thread Pitch : 32
			
			8-32 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 8
				Thread Pitch : 32
			
			10-24 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 10
				Thread Pitch : 24
			
			12-24 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 12
				Thread Pitch : 24
			
			1/4-20 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 1/4
				Thread Pitch : 20
			
			5/16-18 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 5/16
				Thread Pitch : 18
			
			3/8-16 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 3/8
				Thread Pitch : 16
			
			7/16-14 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 7/16
				Thread Pitch : 14
			
			1/2-13 Machine Screw : Inch Machine Screw
				Thread Type : UNC
				Hole Size : 1/2
				Thread Pitch : 13
			
			0-80 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 0
				Thread Pitch : 80
			
			1-72 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 1
				Thread Pitch : 72
			
			2-64 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 2
				Thread Pitch : 64
			
			3-56 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 3
				Thread Pitch : 56
			
			4-48 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 4
				Thread Pitch : 48
			
			6-40 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 6
				Thread Pitch : 40
			
			8-36 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 8
				Thread Pitch : 36
			
			10-32 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 10
				Thread Pitch : 32
			
			1/4-28 Machine Screw : Inch Machine Screw
				Thread Type : UNF
				Hole Size : 1/4
				Thread Pitch : 28
			
			4-36 Machine Screw : Inch Machine Screw
				Thread Type : NS
				Hole Size : 4
				Thread Pitch : 36
			
			ASME B18.6.3 : Standard, Inch Machine Screw
			
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
			
			MS-1013 : 0-80 Machine Screw, ASME B18.6.3 Round 0
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-789 : 1-72 Machine Screw, ASME B18.6.3 Round 1
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-457 : 1-64 Machine Screw, ASME B18.6.3 Round 1
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-458 : 1-64 Machine Screw, ASME B18.6.3 Round 1
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/2
			
			1467 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-779 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3 1/4
			
			380-F08-1N : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			380-F24-2K : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			380-F57-1C : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			380-F77-1X : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			871 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-1021 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 6
			
			MS-1097 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-1117 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2
			
			MS-1118 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			MS-1119 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			MS-390 : 1/4-28 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			MS-73 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-75 : 1/4-20 Machine Screw, ASME B18.6.3 Round 1/4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			1027 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			1028 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			1028-A : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			1484 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			380-131 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4 1/4
			
			380-807 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4 1/2
			
			380-F18-1Y : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F21-1C : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 6
			
			380-F25-1W : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			380-F49-1W : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			380-F63-1W : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F70-1Y : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-F72-1N : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			B-1467 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			B-1506 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			MS-1005 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			MS-1080 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-1093 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-1094 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-1158 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-12 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-1204 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			MS-13 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			MS-14 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-15 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-180 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-192 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-275 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 3/8
			
			MS-414 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-61 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-63 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 1/2
			
			MS-64 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			MS-65 : 10-24 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-66 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-67 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-68 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			MS-69 : 10-32 Machine Screw, ASME B18.6.3 Round 10
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			1032 : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			1032-A : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			1153 : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/4
			
			2077-A : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			380-796 : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			380-797 : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F07-1C : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			380-F20-1Y : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-71 : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			MS-72 : 12-24 Machine Screw, ASME B18.6.3 Round 12
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			380-F04-1A : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-F09-1T : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-F12-1K : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			380-F13-1W : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			380-F19-1C : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-1515 : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			B-1516 : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-35 : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/8
			
			MS-37 : 2-56 Machine Screw, ASME B18.6.3 Round 2
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/16
			
			MS-264 : 3-48 Machine Screw, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-265 : 3-48 Machine Screw, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-266 : 3-56 Machine Screw, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-359 : 3-48 Machine Screw, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1
			
			MS-401 : 3-56 Machine Screw, ASME B18.6.3 Round 3
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-787 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			380-806 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-808 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			380-F40-1M : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F50-1K : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2
			
			380-F75-1W : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-1104 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-1105 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 6
			
			MS-365 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1
			
			MS-385 : 3/8-16 Machine Screw, ASME B18.6.3 Round 3/8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F02-1M : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Clear Trivalent Plated
				Drive Type : Slot
				Length : 5/8
			
			380-F10-1N : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F11-1T : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			380-F26-1M : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			380-F33-1K : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Trivalent
				Drive Type : Slot
				Length : 1 1/2
			
			380-F52-1M : 4-36 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F53-1X : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-411 : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-1189 : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2
			
			MS-44 : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/8
			
			MS-46 : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			MS-49 : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			MS-50 : 4-40 Machine Screw, ASME B18.6.3 Round 4
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 1/4
			
			MS-1016 : 5-40 Machine Screw, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-1307 : 5-40 Machine Screw, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-268 : 5-40 Machine Screw, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-269 : 5-40 Machine Screw, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-270 : 5-40 Machine Screw, ASME B18.6.3 Round 5
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1
			
			380-F48-1K : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F54-1A : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			380-F78-1A : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F88-1M : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			MS-1099 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			MS-1100 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-1101 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 6
			
			MS-1120 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-1166 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			MS-382 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-387 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			MS-484 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Chromate
				Drive Type : Slot
				Length : 3
			
			MS-76 : 5/16-18 Machine Screw, ASME B18.6.3 Round 5/16
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-768 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 4
			
			380-F22-1N : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			380-F36-1C : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/16
			
			380-F37-1W : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			380-F41-1X : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/2
			
			380-F42-1A : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			380-F69-1C : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 1 1/2
			
			786 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			786A : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-1499 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/4
			
			B-1509 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			MS-271 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			MS-3 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2
			
			MS-53 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 7/16
			
			MS-54 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-55 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			MS-7 : 6-32 Machine Screw, ASME B18.6.3 Round 6
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			1042 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3/4
			
			380-F01-1K : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 2 1/4
			
			380-F05-1P : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 3/8
			
			380-F23-1T : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Trivalent Zinc Plated
				Drive Type : Slot
				Length : 4
			
			380-F83-1C : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/2
			
			380-F89-1X : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 1/4
			
			785 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/2
			
			785A : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5/16
			
			B-1500 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1
			
			B-1502 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1 3/4
			
			B-1503 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 2
			
			MS-10 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 3
			
			MS-1244 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 7/8
			
			MS-274 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 3/16
			
			MS-368 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 5
			
			MS-57 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Plated
				Drive Type : Slot
				Length : 1/4
			
			MS-58 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 5/8
			
			MS-9 : 8-32 Machine Screw, ASME B18.6.3 Round 8
				Material : Low Carbon Steel
				Finish : Zinc Chromate Plated
				Drive Type : Slot
				Length : 2 1/2
			
			382-577 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585 : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502 : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514 : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524 : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1T : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538 : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550 : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563 : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575 : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			
			382-577X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585X : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502X : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514X : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524X : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1TX : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538X : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550X : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563X : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575X : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			
			382-577Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585Y : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502Y : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514Y : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524Y : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1TY : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538Y : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550Y : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563Y : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575Y : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			
			382-577Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-166Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-579Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-580Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-581Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-583Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-584Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-585Z : Metric Machine Screw, ISO 1580 M10, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-491Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 3
				Finish : Zinc Plated
				Grade : 1018
			
			382-492Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-493Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-494Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-495Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-496Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-497Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-498Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 14
				Finish : Zinc Plated
				Grade : 1018
			
			382-499Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-468Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-500Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-501Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-502Z : Metric Machine Screw, ISO 1580 M2.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-503Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-504Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-078Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-285Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-079Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-263Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-505Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-506Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-507Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-508Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 22
				Finish : Zinc Plated
				Grade : 1018
			
			382-509Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-510Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-511Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-512Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-513Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-514Z : Metric Machine Screw, ISO 1580 M3, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-515Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-516Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-264Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-517Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-518Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-519Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-520Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-521Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-522Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-523Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-524Z : Metric Machine Screw, ISO 1580 M3.5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-525Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 4
				Finish : Zinc Plated
				Grade : 1018
			
			382-526Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 5
				Finish : Zinc Plated
				Grade : 1018
			
			382-527Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-106Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-528Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-107Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-529Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-265Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-266Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-530Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-531Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-B03-1TZ : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-533Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-534Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-535Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-536Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-537Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-538Z : Metric Machine Screw, ISO 1580 M4, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-120Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 6
				Finish : Zinc Plated
				Grade : 1018
			
			382-121Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-122Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-602Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-267Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-539Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 18
				Finish : Zinc Plated
				Grade : 1018
			
			382-123Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-272Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-540Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-541Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-542Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-543Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-273Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-545Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-546Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-547Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-548Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-549Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-550Z : Metric Machine Screw, ISO 1580 M5, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-551Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 8
				Finish : Zinc Plated
				Grade : 1018
			
			382-137Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-552Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-138Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-553Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-139Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-554Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-603Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-268Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-556Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-557Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-558Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-559Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-560Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-561Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-562Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-563Z : Metric Machine Screw, ISO 1580 M6, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
			
			382-564Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 10
				Finish : Zinc Plated
				Grade : 1018
			
			382-565Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 12
				Finish : Zinc Plated
				Grade : 1018
			
			382-153Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 16
				Finish : Zinc Plated
				Grade : 1018
			
			382-566Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 20
				Finish : Zinc Plated
				Grade : 1018
			
			382-155Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 25
				Finish : Zinc Plated
				Grade : 1018
			
			382-567Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 30
				Finish : Zinc Plated
				Grade : 1018
			
			382-568Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 35
				Finish : Zinc Plated
				Grade : 1018
			
			382-569Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 40
				Finish : Zinc Plated
				Grade : 1018
			
			382-269Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 45
				Finish : Zinc Plated
				Grade : 1018
			
			382-570Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 50
				Finish : Zinc Plated
				Grade : 1018
			
			382-270Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 55
				Finish : Zinc Plated
				Grade : 1018
			
			382-571Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 60
				Finish : Zinc Plated
				Grade : 1018
			
			382-572Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 70
				Finish : Zinc Plated
				Grade : 1018
			
			382-573Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 80
				Finish : Zinc Plated
				Grade : 1018
			
			382-574Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 90
				Finish : Zinc Plated
				Grade : 1018
			
			382-575Z : Metric Machine Screw, ISO 1580 M8, ISO 898-1 4.8
				Length : 100
				Finish : Zinc Plated
				Grade : 1018
		`;
		
		const program = new Program();
		const profileName = "Truth Document Load";
		console.time(profileName);
		await program.addDocument(code);
		program.verify();
		console.timeEnd(profileName);
		console;
	}
}
