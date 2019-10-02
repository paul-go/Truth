
# This is a temporary build script to build the 3
# libraries in this folder. This should be replaced
# for a proper makets script in the future, once
# forwarding of makets scripts is supported.

cd ReflexCore
tsc
makets publish

cd ../ReflexML
tsc
makets publish

cd ../ReflexMLNode
tsc
makets publish
